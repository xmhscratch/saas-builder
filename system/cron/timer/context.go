package timer

import (
	"sync"

	"localdomain/cron-scheduler/core"

	"github.com/robfig/cron"
	"gorm.io/gorm"
)

// Server comment
type Server struct {
	cfg     *core.Config
	wg      *sync.WaitGroup
	cronTab *CronTab
}

const (
	exchange     = "scheduler" // Durable, non-auto-deleted AMQP exchange name
	exchangeType = "topic"     // Exchange type - direct|fanout|topic|x-custom
	queueName    = "scheduler" // Ephemeral AMQP queue name
	bindingKey   = "scheduler" // AMQP binding key
	routingKey   = "scheduler" // AMQP binding key
	consumerTag  = "scheduler" // AMQP consumer tag (should not be blank)
)

// CronTab comment
type CronTab struct {
	cfg       *core.Config
	mainDb    *gorm.DB
	msq       *Publisher
	cron      *cron.Cron
	cronNames []string
}

// CronJobHandler comment
type CronJobHandler func(string, string, string) error
