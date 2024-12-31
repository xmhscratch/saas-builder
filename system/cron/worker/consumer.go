package worker

// core packages
import (
	"encoding/json"
	"errors"
	"log"
	"net"
	"os"
	"time"

	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/task"
	"localdomain/cron-scheduler/task/job"

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

// Consumer comment
type Consumer struct {
	cfg             *core.Config
	connection      *amqp.Connection
	channel         *amqp.Channel
	isReady         bool
	logger          *log.Logger
	done            chan bool
	notifyConnClose chan *amqp.Error
	notifyChanClose chan *amqp.Error
	notifyConfirm   chan amqp.Confirmation
	reportList      *task.List
}

// NewConsumer comment
func NewConsumer(cfg *core.Config) *Consumer {
	ctx := &Consumer{
		cfg:    cfg,
		logger: log.New(os.Stdout, "", log.LstdFlags),
		done:   make(chan bool),
	}
	go ctx.handleReconnect()

	return ctx
}

// handleReconnect will wait for a connection error on
// notifyConnClose, and then continuously attempt to reconnect.
func (ctx *Consumer) handleReconnect() {
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
func (ctx *Consumer) connect() (*amqp.Connection, error) {
	conn, err := amqp.DialConfig(
		ctx.cfg.AMQPConnectionString,
		amqp.Config{
			Dial: func(network, addr string) (net.Conn, error) {
				return net.DialTimeout(network, addr, 30*time.Second)
			},
			Properties: amqp.Table{
				"product":  os.Getenv("APP_NAME"),
				"platform": "consumer",
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
func (ctx *Consumer) handleReInit(conn *amqp.Connection) bool {
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
func (ctx *Consumer) init(conn *amqp.Connection) error {
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf(err.Error())
		return err
	}

	_, err = ch.QueueDeclare(
		exchange,
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

	err = ch.QueueBind(
		routingKey,
		bindingKey,
		exchange,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	ctx.changeChannel(ch)
	ctx.isReady = true

	reportList, err := task.NewList(task.ReportFunctionList)
	if err != nil {
		return err
	}
	ctx.reportList = reportList
	ctx.Start()

	return nil
}

// changeConnection takes a new connection to the queue,
// and updates the close listener to reflect this.
func (ctx *Consumer) changeConnection(connection *amqp.Connection) {
	ctx.connection = connection
	ctx.notifyConnClose = make(chan *amqp.Error)
	ctx.connection.NotifyClose(ctx.notifyConnClose)
}

// changeChannel takes a new channel to the queue,
// and updates the channel listeners to reflect this.
func (ctx *Consumer) changeChannel(channel *amqp.Channel) (err error) {
	ctx.channel = channel

	err = ctx.channel.Qos(10, 0, false)
	if err != nil {
		return err
	}

	ctx.notifyChanClose = make(chan *amqp.Error)
	ctx.channel.NotifyClose(ctx.notifyChanClose)

	return err
}

// Start comment
func (ctx *Consumer) Start() (err error) {
	if !ctx.isReady {
		return errNotConnected
	}

	messages, err := ctx.channel.Consume(
		queueName,
		consumerTag,
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	go func(deliveries <-chan amqp.Delivery) (err error) {
		for delivery := range deliveries {
			var rpd job.ReportData

			_ = json.Unmarshal(delivery.Body, &rpd)
			if err != nil {
				log.Println(err)
				delivery.Reject(true)

				continue
			}
			// rpd.Webhook = ctx.wh
			// rpd.Config = ctx.cfg

			_, err = ctx.reportList.Run(rpd.Name, ctx.cfg, &rpd)
			if err != nil {
				log.Println(err)
				delivery.Reject(true)

				continue
			}

			timeNow := time.Now()
			msg := core.BuildString(
				"Cron `", rpd.Name,
				"` scheduled on `", timeNow.Format("2006-01-02 15:04:05"),
				"`",
			)
			log.Println(msg)

			delivery.Ack(true)
			continue
		}

		return err
	}(messages)

	return err
}

// Dispose comment
func (ctx *Consumer) Dispose() error {
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
