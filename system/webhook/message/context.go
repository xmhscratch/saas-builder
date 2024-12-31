package message

import (
	"log"

	"localdomain/webhook/core"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	exchange     = "webhook" // Durable, non-auto-deleted AMQP exchange name
	exchangeType = "topic"   // Exchange type - direct|fanout|topic|x-custom
	queueName    = "webhook" // Ephemeral AMQP queue name
	bindingKey   = "webhook" // AMQP binding key
	routingKey   = "webhook" // AMQP binding key
	consumerTag  = "webhook" // AMQP consumer tag (should not be blank)
)

// Server comment
type Server struct {
	cfg *core.Config
	msq *Consumer
}

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
}
