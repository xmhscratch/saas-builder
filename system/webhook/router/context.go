package router

import (
	"localdomain/webhook/core"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Server comment
type Server struct {
	cfg *core.Config
	msq *Publisher
}

var (
	exchange     = "webhook" // Durable, non-auto-deleted AMQP exchange name
	exchangeType = "topic"   // Exchange type - direct|fanout|topic|x-custom
	queueName    = "webhook" // Ephemeral AMQP queue name
	bindingKey   = "webhook" // AMQP binding key
	routingKey   = "webhook" // AMQP binding key
	consumerTag  = "webhook" // AMQP consumer tag (should not be blank)
)

// Publisher comment
type Publisher struct {
	cfg          *core.Config
	mqConnection *amqp.Connection
	mqChannel    *amqp.Channel
}
