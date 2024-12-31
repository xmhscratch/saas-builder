package main

import (
	// "log"
	"os"

	"localdomain/cron-scheduler/core"
	"localdomain/cron-scheduler/timer"
	"localdomain/cron-scheduler/worker"

	"github.com/urfave/cli"
)

func main() {
	cfg, err := core.NewConfig("")
	if err != nil {
		panic(err)
	}

	app := cli.NewApp()
	app.Commands = []cli.Command{
		{
			Name:    "start-timer",
			Aliases: []string{"s"},
			Usage:   "Start timer server",
			Action: func(c *cli.Context) error {
				cronNames := c.Args()
				timerServer, err := timer.NewServer(cfg, cronNames)
				if err != nil {
					return err
				}
				return timerServer.Start()
			},
		},
		{
			Name:  "start-worker",
			Usage: "Start worker server",
			Action: func(c *cli.Context) error {
				workerServer, err := worker.NewServer(cfg)
				if err != nil {
					return err
				}
				return workerServer.Start()
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		panic(err)
	}
}
