package router

import (
	"net"
	"os"
	"time"

	"localdomain/webhook/core"

	amqp "github.com/rabbitmq/amqp091-go"
)

// NewPublisher comment
func NewPublisher(cfg *core.Config) (*Publisher, error) {
	// Connects opens an AMQP connection from the credentials in the URL.
	mqConnection, err := amqp.DialConfig(
		cfg.AMQPConnectionString,
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

	mqChannel, err := mqConnection.Channel()
	if err != nil {
		return nil, err
	}

	err = mqChannel.ExchangeDeclare(
		exchange,
		exchangeType,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}

	_, err = mqChannel.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		return nil, err
	}

	err = mqChannel.QueueBind(
		queueName,
		bindingKey,
		exchange,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}

	ctx := &Publisher{
		cfg:          cfg,
		mqChannel:    mqChannel,
		mqConnection: mqConnection,
	}

	return ctx, err
}

// Publish comment
func (ctx *Publisher) Publish(data []byte, errChan chan error) (err error) {
	err = ctx.mqChannel.Publish(
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

	errChan <- err
	return err
}

// Dispose comment
func (ctx *Publisher) Dispose() {
	defer ctx.mqConnection.Close()
}
