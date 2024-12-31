package message

// core packages
import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"localdomain/webhook/core"

	"github.com/buger/jsonparser"
	qs "github.com/derekstavis/go-qs"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	// When reconnecting to the server after connection failure
	reconnectDelay = 5 * time.Second

	// When setting up the channel after a channel exception
	reInitDelay = 2 * time.Second

	// // When resending messages the server didn't confirm
	// resendDelay = 5 * time.Second
)

var (
	errNotConnected  = errors.New("not connected to a server")
	errAlreadyClosed = errors.New("already closed: not connected to the server")
)

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
func (ctx *Consumer) handleReconnect() error {
	var (
		err     error = nil
		attempt int   = 0
	)

	for {
		if attempt > 50 {
			return errNotConnected
		}
		ctx.isReady = false

		conn, err := ctx.connect()
		if err != nil {
			fmt.Printf("failed to connect: %s. retrying...", err)

			select {
			case <-ctx.done:
				return nil
			case <-time.After(reconnectDelay):
				attempt++
			}
			continue
		}

		if done := ctx.handleReInit(conn); done {
			break
		}
	}

	return err
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
	return conn, nil
}

// handleReconnect will wait for a channel error
// and then continuously attempt to re-initialize both channels
func (ctx *Consumer) handleReInit(conn *amqp.Connection) bool {
	var attempt int = 0

	for {
		if attempt > 50 {
			break
		}

		ctx.isReady = false

		err := ctx.init(conn)
		if err != nil {
			fmt.Printf("failed to initialize channel: %s. retrying...", err)

			select {
			case <-ctx.done:
				return true
			case <-time.After(reInitDelay):
				attempt++
			}
			continue
		}

		select {
		case <-ctx.done:
			return true
		case <-ctx.notifyConnClose:
			log.Println("connection closed. reconnecting...")
			return false
		case <-ctx.notifyChanClose:
			log.Println("channel closed. re-running init...")
		}
	}

	return false
}

// init will initialize channel & declare queue
func (ctx *Consumer) init(conn *amqp.Connection) error {
	ch, err := conn.Channel()
	if err != nil {
		return err
	}

	err = ch.Confirm(false)

	if err != nil {
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

	if err = ch.QueueBind(
		queueName,
		bindingKey,
		exchange,
		false,
		nil,
	); err != nil {
		return err
	}

	ctx.changeChannel(ch)
	ctx.isReady = true

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
	ctx.notifyConfirm = make(chan amqp.Confirmation)
	ctx.channel.NotifyClose(ctx.notifyChanClose)

	return err
}

// Start comment
func (ctx *Consumer) Start() (err error) {
	// log.Println(ctx.channel)
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

	msgErr := make(chan error)
	go func(deliveries <-chan amqp.Delivery, e chan error) {
		for delivery := range deliveries {
			// log.Println(string(delivery.Body[:]))

			err = ctx.SendWebHookRequest(delivery.Body)
			if err == nil {
				delivery.Ack(true)
				continue
			}

			e <- err

			if time.Now().After(delivery.Timestamp.Add(1 * time.Minute)) {
				delivery.Reject(false)
				continue
			}
			if !delivery.Redelivered {
				delivery.Reject(true)
				continue
			}
		}
	}(messages, msgErr)

	err = <-msgErr
	defer close(msgErr)

	return err
}

// SendWebHookRequest comment
func (ctx *Consumer) SendWebHookRequest(data []byte) error {
	respBytes := make(chan []byte, 64)
	respErr := make(chan error, 64)

	go func(cByts chan []byte, cErr chan error) {
		rawMethod, _ := jsonparser.GetString(data, "method")
		rawURL, _ := jsonparser.GetString(data, "url")
		rawData, _, _, _ := jsonparser.Get(data, "data")
		rawHeaders, _, _, _ := jsonparser.Get(data, "headers")

		if rawMethod == "" {
			rawMethod = "POST"
		}
		// log.Println(rawMethod, rawURL, string(rawData[:]), string(rawHeaders[:]))

		var postQs string
		var postData map[string]interface{}
		if len(rawData) > 0 {
			err := json.Unmarshal(rawData, &postData)
			if err != nil {
				cErr <- err
				cByts <- nil
				return
			}
			if postQs, err = qs.Marshal(postData); err != nil {
				cErr <- err
				cByts <- nil
				return
			}
		}

		req, err := http.NewRequest(rawMethod, rawURL, strings.NewReader(postQs))
		if err != nil {
			cErr <- err
			cByts <- nil
			return
		}

		var headers map[string]interface{}
		if len(rawHeaders) > 0 {
			err = json.Unmarshal(rawHeaders, &headers)
			if err != nil {
				cErr <- err
				cByts <- nil
				return
			}
			for headerKey, headerValue := range headers {
				req.Header.Set(headerKey, headerValue.(string))
			}
		}
		req.Header.Set("content-type", "application/x-www-form-urlencoded")

		client := &http.Client{
			Timeout: time.Second * 300,
			Transport: &http.Transport{
				Dial: (&net.Dialer{
					Timeout: 30 * time.Second,
				}).Dial,
				TLSHandshakeTimeout: 30 * time.Second,
			},
		}

		resp, err := client.Do(req)
		if err != nil {
			cErr <- err
			cByts <- nil
			return
		}
		defer resp.Body.Close()

		if respBody, err := io.ReadAll(resp.Body); err != nil {
			log.Println(err)

			cErr <- err
			cByts <- nil
		} else {
			cByts <- respBody
			cErr <- nil
		}
	}(respBytes, respErr)

	<-respBytes
	err := <-respErr

	defer close(respBytes)
	defer close(respErr)

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

	defer close(ctx.done)
	ctx.isReady = false

	return nil
}
