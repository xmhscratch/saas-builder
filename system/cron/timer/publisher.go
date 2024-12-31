package timer

// core packages
import (
	"errors"
	"log"
	"net"
	"os"
	"time"

	"localdomain/cron-scheduler/core"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	// When reconnecting to the server after connection failure
	reconnectDelay = 5 * time.Second

	// When setting up the channel after a channel exception
	reInitDelay = 2 * time.Second

	// When resending messages the server didn't confirm
	resendDelay = 5 * time.Second
)

var (
	errNotConnected  = errors.New("not connected to a server")
	errAlreadyClosed = errors.New("already closed: not connected to the server")
	errShutdown      = errors.New("session is shutting down")
)

// Publisher comment
type Publisher struct {
	cfg             *core.Config
	connection      *amqp.Connection
	channel         *amqp.Channel
	isReady         bool
	logger          *log.Logger
	done            chan bool
	notifyConnClose chan *amqp.Error
	notifyChanClose chan *amqp.Error
	notifyConfirm   chan amqp.Confirmation
}

// NewPublisher comment
func NewPublisher(cfg *core.Config) *Publisher {
	ctx := &Publisher{
		cfg:    cfg,
		logger: log.New(os.Stdout, "", log.LstdFlags),
		done:   make(chan bool),
	}
	go ctx.handleReconnect()

	return ctx
}

// handleReconnect will wait for a connection error on
// notifyConnClose, and then continuously attempt to reconnect.
func (ctx *Publisher) handleReconnect() {
	for {
		ctx.isReady = false
		// log.Println("Attempting to connect")

		conn, err := ctx.connect()
		if err != nil {
			log.Println("Failed to connect. Retrying...")

			select {
			case <-ctx.done:
				return
			case <-time.After(reconnectDelay):
			}
			continue
		}

		if done := ctx.handleReInit(conn); done {
			break
		}
	}
}

// connect will create a new AMQP connection
func (ctx *Publisher) connect() (*amqp.Connection, error) {
	conn, err := amqp.DialConfig(
		ctx.cfg.AMQPConnectionString,
		amqp.Config{
			Dial: func(network, addr string) (net.Conn, error) {
				return net.DialTimeout(network, addr, 30*time.Second)
			},
			Properties: amqp.Table{
				"product":  os.Getenv("APP_NAME"),
				"platform": "publisher",
				"version":  "1.0.0",
			},
		},
	)
	if err != nil {
		return nil, err
	}

	ctx.changeConnection(conn)
	// log.Println("Connected!")
	return conn, nil
}

// handleReconnect will wait for a channel error
// and then continuously attempt to re-initialize both channels
func (ctx *Publisher) handleReInit(conn *amqp.Connection) bool {
	for {
		ctx.isReady = false

		err := ctx.init(conn)
		// log.Println(err)
		if err != nil {
			log.Println("Failed to initialize channel. Retrying...")

			select {
			case <-ctx.done:
				return true
			case <-time.After(reInitDelay):
			}
			continue
		}

		// log.Println(
		// 	<-ctx.done,
		// 	<-ctx.notifyConnClose,
		// 	<-ctx.notifyChanClose,
		// )
		select {
		case <-ctx.done:
			return true
		case <-ctx.notifyConnClose:
			log.Println("Connection closed. Reconnecting...")
			return false
		case <-ctx.notifyChanClose:
			log.Println("Channel closed. Re-running init...")
		}
	}
}

// init will initialize channel & declare queue
func (ctx *Publisher) init(conn *amqp.Connection) error {
	ch, err := conn.Channel()
	if err != nil {
		log.Println(err)
		return err
	}

	err = ch.Confirm(false)
	if err != nil {
		log.Println(err)
		return err
	}

	err = ch.ExchangeDeclare(
		exchange,
		exchangeType,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Println(err)
		return err
	}

	err = ch.ExchangeBind(
		routingKey, // destination
		bindingKey, // key
		exchange,   // source
		true,       // noWait
		nil,        // args
	)
	if err != nil {
		log.Println(err)
		return err
	}

	ctx.changeChannel(ch)
	ctx.isReady = true

	return nil
}

// changeConnection takes a new connection to the queue,
// and updates the close listener to reflect this.
func (ctx *Publisher) changeConnection(connection *amqp.Connection) {
	ctx.connection = connection
	ctx.notifyConnClose = make(chan *amqp.Error)
	ctx.connection.NotifyClose(ctx.notifyConnClose)
}

// changeChannel takes a new channel to the queue,
// and updates the channel listeners to reflect this.
func (ctx *Publisher) changeChannel(channel *amqp.Channel) (err error) {
	ctx.channel = channel

	ctx.notifyChanClose = make(chan *amqp.Error)
	ctx.notifyConfirm = make(chan amqp.Confirmation)
	ctx.channel.NotifyClose(ctx.notifyChanClose)
	ctx.channel.NotifyPublish(ctx.notifyConfirm)

	return err
}

// Publish comment
func (ctx *Publisher) Publish(cronName string, data []byte, errChan chan error) (err error) {
	if !ctx.isReady {
		err = errors.New("failed to push push: not connected")
		errChan <- err

		return err
	}

	for {
		err := ctx.UnsafePush(data)
		if err != nil {
			ctx.logger.Println(err)
			select {
			case <-ctx.done:
				return errShutdown
			case <-time.After(resendDelay):
			}
			continue
		}
		select {
		case confirm := <-ctx.notifyConfirm:
			if confirm.Ack {
				timeNow := time.Now()
				msg := core.BuildString(
					"Cron `", cronName,
					"` scheduled on `", timeNow.Format("2006-01-02 15:04:05"),
					"`",
				)
				log.Println(msg)

				// ctx.logger.Println("Push confirmed!")
				return nil
			}
		case <-time.After(resendDelay):
		}
		ctx.logger.Println("Push didn't confirm. Retrying...")
	}

	errChan <- err
	return err
}

// UnsafePush will push to the queue without checking for
// confirmation. It returns an error if it fails to connect.
// No guarantees are provided for whether the server will
// recieve the message.
func (ctx *Publisher) UnsafePush(data []byte) error {
	if !ctx.isReady {
		return errNotConnected
	}

	return ctx.channel.Publish(
		exchange,   // exchange
		routingKey, // routing key
		false,      // mandatory
		false,      // immediate
		amqp.Publishing{
			Headers:         amqp.Table{},
			ContentType:     "application/json",
			ContentEncoding: "",
			Timestamp:       time.Now(),
			Body:            data,
			DeliveryMode:    amqp.Transient, // 1=non-persistent, 2=persistent
			Priority:        0,              // 0-9
		},
	)
}

// Dispose comment
func (ctx *Publisher) Dispose() error {
	if !ctx.isReady {
		return errAlreadyClosed
	}

	if ctx.channel != nil {
		if err := ctx.channel.Cancel(consumerTag, true); err != nil {
			log.Fatalf("Consumer cancel failed: %s", err)
			return err
		}
		ctx.channel.NotifyClose(ctx.notifyChanClose)
		if err := <-ctx.notifyChanClose; err != nil {
			log.Fatalf(err.Error())
			return err
		}
	}

	if ctx.connection != nil {
		ctx.connection.NotifyClose(ctx.notifyConnClose)
		if err := <-ctx.notifyConnClose; err != nil {
			log.Fatalf(err.Error())
			return err
		}
	}

	close(ctx.done)
	ctx.isReady = false

	return nil
}
