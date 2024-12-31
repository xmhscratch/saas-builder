package core

// core packages
import (
	"errors"
	"log"
	"net"
	"os"
	"time"

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

var (
	whExchange     = "webhook" // Durable, non-auto-deleted AMQP exchange name
	whExchangeType = "topic"   // Exchange type - direct|fanout|topic|x-custom
	whQueueName    = "webhook" // Ephemeral AMQP queue name
	whBindingKey   = "webhook" // AMQP binding key
	whRoutingKey   = "webhook" // AMQP binding key
	whConsumerTag  = "webhook" // AMQP consumer tag (should not be blank)
)

// WebhookPublisher comment
type WebhookPublisher struct {
	cfg             *Config
	connection      *amqp.Connection
	channel         *amqp.Channel
	isReady         bool
	logger          *log.Logger
	done            chan bool
	notifyConnClose chan *amqp.Error
	notifyChanClose chan *amqp.Error
	notifyConfirm   chan amqp.Confirmation
}

// NewWebhookPublisher comment
func NewWebhookPublisher(cfg *Config) *WebhookPublisher {
	ctx := &WebhookPublisher{
		cfg:    cfg,
		logger: log.New(os.Stdout, "", log.LstdFlags),
		done:   make(chan bool),
	}
	go ctx.handleReconnect()

	return ctx
}

// handleReconnect will wait for a connection error on
// notifyConnClose, and then continuously attempt to reconnect.
func (ctx *WebhookPublisher) handleReconnect() {
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
func (ctx *WebhookPublisher) connect() (*amqp.Connection, error) {
	conn, err := amqp.DialConfig(
		ctx.cfg.AMQPConnectionString,
		amqp.Config{
			Dial: func(network, addr string) (net.Conn, error) {
				return net.DialTimeout(network, addr, 30*time.Second)
			},
			Properties: amqp.Table{
				"product":  os.Getenv("APP_NAME"),
				"platform": "webhook.publisher",
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
func (ctx *WebhookPublisher) handleReInit(conn *amqp.Connection) bool {
	for {
		ctx.isReady = false

		err := ctx.init(conn)
		if err != nil {
			log.Println("Failed to initialize channel. Retrying...")

			select {
			case <-ctx.done:
				return true
			case <-time.After(reInitDelay):
			}
			continue
		}

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
func (ctx *WebhookPublisher) init(conn *amqp.Connection) error {
	ch, err := conn.Channel()
	if err != nil {
		return err
	}

	err = ch.Confirm(false)

	if err != nil {
		return err
	}

	_, err = ch.QueueDeclare(
		whExchange,
		true,  // Durable
		false, // Delete when unused
		false, // Exclusive
		false, // No-wait
		nil,
		// amqp.Table{
		// 	"x-message-ttl": int32(60000),
		// }, // Arguments
	)
	if err != nil {
		return err
	}

	ctx.changeChannel(ch)
	ctx.isReady = true

	return nil
}

// changeConnection takes a new connection to the queue,
// and updates the close listener to reflect this.
func (ctx *WebhookPublisher) changeConnection(connection *amqp.Connection) {
	ctx.connection = connection
	ctx.notifyConnClose = make(chan *amqp.Error)
	ctx.connection.NotifyClose(ctx.notifyConnClose)
}

// changeChannel takes a new channel to the queue,
// and updates the channel listeners to reflect this.
func (ctx *WebhookPublisher) changeChannel(channel *amqp.Channel) (err error) {
	ctx.channel = channel

	err = ctx.channel.Qos(10, 0, false)
	if err != nil {
		return err
	}

	ctx.notifyChanClose = make(chan *amqp.Error)
	ctx.notifyConfirm = make(chan amqp.Confirmation)
	ctx.channel.NotifyClose(ctx.notifyChanClose)

	return err
}

// Publish comment
func (ctx *WebhookPublisher) Publish(data []byte) (err error) {
	err = ctx.channel.Publish(
		whExchange,   // exchange
		whRoutingKey, // routing key
		false,        // mandatory
		false,        // immediate
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
	return err
}

// Dispose comment
func (ctx *WebhookPublisher) Dispose() {
	if ctx.channel != nil {
		ctx.channel.NotifyClose(ctx.notifyChanClose)
		if err := <-ctx.notifyChanClose; err != nil {
			log.Println(err)
		}
	}

	if ctx.connection != nil {
		ctx.connection.NotifyClose(ctx.notifyConnClose)
		if err := <-ctx.notifyConnClose; err != nil {
			log.Println(err)
		}
	}

	// if ctx.connection != nil {
	// 	ctx.connection.Close()
	// }
}
