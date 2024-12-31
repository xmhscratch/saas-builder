package core

import (
	"io"
	// "log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"

	"github.com/anacrolix/missinggo"
	"github.com/gin-gonic/gin"
	"github.com/juju/ratelimit"
	RangeParser "github.com/xmhscratch/range-parser"
)

// NewDownloadTempFile comment
func (ctx *Server) NewDownloadTempFile() gin.HandlerFunc {
	return func(ginCtx *gin.Context) {
		// secureID := ginCtx.Param("secureID")
		filePath := ginCtx.Param("filePath")
		filePath = BuildString("/export/tmp/", filePath)
		filePath = filepath.Clean(filePath)

		fileReader, err := os.Open(filePath)
		if err != nil {
			ctx.Error(err)(ginCtx)
			return
		}

		fStat, err := fileReader.Stat()
		if err != nil {
			ctx.Error(err)(ginCtx)
			return
		}
		fileSize := fStat.Size()

		ginCtx.Writer.Header().Set("Accept-Ranges", "bytes")
		ginCtx.Writer.Header().Set("Cache-Control", "no-cache")

		re, err := regexp.Compile(`[\/]{0,1}([\w\W]+)+([\.]{1}[a-zA-Z0-9]+?)$`)
		matches := re.FindStringSubmatch(filePath)
		if err != nil {
			ctx.Error(err)(ginCtx)
			return
		}

		if len(matches) == 3 {
			ginCtx.Writer.Header().Set("Content-Type", mime.TypeByExtension(matches[2]))
		} else {
			ginCtx.Writer.Header().Set("Content-Type", "application/octet-stream")
		}

		if ginCtx.Request.URL.Query().Get("mime") == "" {
			ginCtx.Writer.Header().Set("Content-Disposition", "attachment; filename="+filePath)
		}

		// Support DLNA streaming
		ginCtx.Writer.Header().Set("transferMode.dlna.org", "Streaming")
		ginCtx.Writer.Header().Set("contentFeatures.dlna.org", "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000")

		bucket := ratelimit.NewBucketWithRate(512000, 512000)
		partialOffset := int64(0)

		if ginCtx.Request.Header.Get("Range") != "" {
			rangeParser := RangeParser.Parse(fileSize, ginCtx.Request.Header.Get("Range"))[0]
			startByte := rangeParser.Start
			endByte := rangeParser.End
			_ = missinggo.NewSectionReadSeeker(fileReader, partialOffset+startByte, partialOffset+endByte)

			if ginCtx.Request.URL.Query().Get("mime") != "" {
				ginCtx.Writer.Header().Set("Content-Range", "bytes "+strconv.FormatInt(startByte, 10)+"-"+strconv.FormatInt(endByte, 10)+"/"+strconv.FormatInt(fileSize, 10))
				ginCtx.Writer.Header().Set("Content-Length", strconv.FormatInt(endByte-startByte+1, 10))
			}

			ginCtx.Writer.WriteHeader(http.StatusPartialContent)
		} else {
			ginCtx.Writer.Header().Set("Content-Length", strconv.FormatInt(fileSize, 10))
			_ = missinggo.NewSectionReadSeeker(fileReader, partialOffset, fileSize)
		}

		defer io.Copy(ginCtx.Writer, ratelimit.Reader(fileReader, bucket))
	}
}
