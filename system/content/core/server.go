package core

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

func NewServer(cfg *Config, conn redis.UniversalClient) (*Server, error) {
	var (
		err error
		ctx *Server
	)

	ctx = &Server{
		Config:          cfg,
		RedisConnection: conn,
	}

	router := gin.Default()
	router.Use(gin.CustomRecovery(func(ginCtx *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			ginCtx.String(http.StatusInternalServerError, fmt.Sprintf("error: %s", err))
		}
		ginCtx.AbortWithStatus(http.StatusInternalServerError)
	}))
	router.GET("/health", func(ginCtx *gin.Context) {
		ginCtx.JSON(http.StatusOK, gin.H{})
	})
	router.GET("/tmp/:secureID/*filePath", ctx.NewDownloadTempFile())
	router.POST("/tmp/:secureID/*filePath", ctx.NewDownloadTempFile())

	router.GET("/dwl/:sessionID/:fileKey/*filePath", ctx.NewDownloadSession())
	router.POST("/dwl/:sessionID/:fileKey/*filePath", ctx.NewDownloadSession())
	// router.GET("/dwldrv/:driveID/:fileID", ctx.NewDriveFileDownload(cfg, conn))

	ctx.Router = router
	return ctx, err
}

// Start comment
func (ctx *Server) Start() (err error) {
	if ctx.Router == nil {
		return fmt.Errorf("server is uninitialized")
	}
	portNumber := BuildString(":", ctx.Config.Port)
	return ctx.Router.Run(portNumber)
}

// Error comment
func (ctx *Server) Error(err error) gin.HandlerFunc {
	return func(ginCtx *gin.Context) {
		errMsg := err.Error()

		log.Printf("Error: %+v\n", errMsg)

		ginCtx.JSON(http.StatusOK, gin.H{
			"error": map[string]interface{}{"message": errMsg},
		})
	}
}
