package worker

import (
	"sync"

	"localdomain/cron-scheduler/core"
)

// Server comment
type Server struct {
	cfg *core.Config
	wg  *sync.WaitGroup
	msq *Consumer
}

var (
	exchange     = "scheduler" // Durable, non-auto-deleted AMQP exchange name
	exchangeType = "topic"     // Exchange type - direct|fanout|topic|x-custom
	queueName    = "scheduler" // Ephemeral AMQP queue name
	bindingKey   = "scheduler" // AMQP binding key
	routingKey   = "scheduler" // AMQP binding key
	consumerTag  = "scheduler" // AMQP consumer tag (should not be blank)
)
