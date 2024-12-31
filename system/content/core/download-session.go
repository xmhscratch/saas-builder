package core

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strconv" // "mime"

	"github.com/gin-gonic/gin"
	// "github.com/go-redis/redis/v8"
	"github.com/juju/ratelimit"
)

// NewDriveFileDownload comment
func (ctx *Server) NewDriveFileDownload() gin.HandlerFunc {
	return func(ginCtx *gin.Context) {
		driveID := ginCtx.Param("driveID")
		fileID := ginCtx.Param("fileID")

		err := make(chan error)
		respBytes := make(chan []byte, 64)

		go func(byts chan []byte, e chan error) {
			u, err := url.Parse(BuildString("http://", ctx.Config.DownloadClusterHostName, "/storage", "/", driveID, "/", fileID))
			if err != nil {
				e <- err
				return
			}
			u.Scheme = "http"
			u.Host = ctx.Config.DownloadClusterHostName

			req, err := http.NewRequest("GET", u.String(), nil)
			if err != nil {
				e <- err
				return
			}
			res, err := HTTPClient.Do(req)
			if err != nil {
				e <- err
				return
			}
			defer res.Body.Close()

			if resBody, err := io.ReadAll(res.Body); err != nil {
				e <- err
				return
			} else {
				byts <- resBody
			}
		}(respBytes, err)

		defer close(err)
		defer close(respBytes)

		if <-err != nil {
			ctx.Error(<-err)(ginCtx)
			return
		}

		downloadLinkResp := new(DownloadLinkResponse)
		if err := json.Unmarshal(<-respBytes, &downloadLinkResp); err != nil {
			ctx.Error(err)(ginCtx)
			return
		}

		fileDownloadInfo := downloadLinkResp.Results.Files[0]
		ginCtx.Redirect(http.StatusSeeOther, fileDownloadInfo.DownloadURL)
	}
}

// NewDownloadSession comment
func (ctx *Server) NewDownloadSession() gin.HandlerFunc {
	var (
		downloadLimit int64 = 0
		expirationDay int64 = 0
	)

	session := &DownloadSession{
		cfg:  ctx.Config,
		conn: ctx.RedisConnection,
	}

	return func(ginCtx *gin.Context) {
		var (
			err    error
			values map[string]string
		)
		session.ID = ginCtx.Param("sessionID")
		session.FileKey = ginCtx.Param("fileKey")
		session.FilePath = ginCtx.Param("filePath")
		session.requestFilePath = ginCtx.Request.RequestURI

		downloadKeyName := BuildString("download:", session.ID)
		downloadNames := ctx.RedisConnection.HGetAll(context.TODO(), downloadKeyName)
		if err = downloadNames.Err(); err != nil {
			ctx.Error(err)(ginCtx)
			return
		}

		values, err = downloadNames.Result()
		if err != nil {
			ctx.Error(err)(ginCtx)
			return
		}

		session.CreatorID = values["creatorId"]

		if values["downloadLimit"] != "" {
			downloadLimit, err = strconv.ParseInt(values["downloadLimit"], 10, 64)
			if err != nil {
				ctx.Error(err)(ginCtx)
				return
			}
		}
		session.DownloadLimit = downloadLimit

		if values["expirationDay"] != "" {
			expirationDay, err = strconv.ParseInt(values["expirationDay"], 10, 64)
			if err != nil {
				ctx.Error(err)(ginCtx)
				return
			}
		}
		session.ExpirationDay = expirationDay

		// var files []map[string]string
		// json.Unmarshal([]byte(values["files"]), &files)

		// for _, file := range files {
		// 	var fileSize int64 = 0

		// 	if file["fileSize"] != "" {
		// 		fileSize, err = strconv.ParseInt(file["fileSize"], 10, 64)
		// 		if err != nil {
		// 			log.Panicln(err)
		// 			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		// 			return
		// 		}
		// 	}

		// 	fileInfo := &FileInfo{
		// 		SourceURL:   file["sourceUrl"],
		// 		DownloadURL: file["downloadUrl"],
		// 		FileName:    file["fileName"],
		// 		FileSize:    fileSize,
		// 	}

		// 	session.Files = append(session.Files, fileInfo)
		// }

		defer session.Download(ctx, ginCtx)
	}
}

// GetSelectedFile comment
func (ctx *DownloadSession) GetSelectedFile() (*FileInfo, error) {
	var (
		err             error
		values          map[string]string
		selectedFile    *FileInfo
		downloadedCount int64 = 0
		fileSize        int64 = 0
	)

	fileKeyName := BuildString("download", ":", ctx.ID, ":", ctx.FileKey)
	fileName := ctx.conn.HGetAll(context.TODO(), fileKeyName)
	if err = fileName.Err(); err != nil {
		log.Panicln(err)
		return nil, err
	}

	values, err = fileName.Result()
	if err != nil {
		log.Panicln(err)
		return nil, err
	}

	if values["fileSize"] != "" {
		fileSize, err = strconv.ParseInt(values["fileSize"], 10, 64)
		if err != nil {
			log.Panicln(err)
			return nil, err
		}
	}

	if fileSize == 0 {
		return nil, err
	}

	if values["downloadedCount"] != "" {
		downloadedCount, err = strconv.ParseInt(values["downloadedCount"], 10, 64)
		if err != nil {
			log.Panicln(err)
			return nil, err
		}
	}

	selectedFile = &FileInfo{
		SourceURL:       values["sourceUrl"],
		DownloadURL:     values["downloadUrl"],
		DownloadedCount: downloadedCount,
		FileName:        values["fileName"],
		FileSize:        fileSize,
	}

	return selectedFile, nil
}

// GetFileName comment
func (ctx *DownloadSession) GetFileName(filePath string) (string, error) {
	re, err := regexp.Compile(`[\/]{0,1}([\w\W]+)+([\.]{1}[a-zA-Z0-9]+?)$`)
	if err != nil {
		return "", err
	}

	matches := re.FindStringSubmatch(filePath)
	if len(matches) == 3 {
		return matches[1], nil
	}

	return "", errors.New("file not found")
}

// GetFileExt comment
func (ctx *DownloadSession) GetFileExt(filePath string) (string, error) {
	defaultExt := ".bin"
	re, err := regexp.Compile(`[\/]{0,1}([\w\W]+)+([\.]{1}[a-zA-Z0-9]+?)$`)
	if err != nil {
		return defaultExt, err
	}

	matches := re.FindStringSubmatch(filePath)
	// mime.TypeByExtension()
	if len(matches) == 3 {
		return matches[2], nil
	}

	return defaultExt, nil
}

// Download comment
func (ctx *DownloadSession) Download(svrCtx *Server, ginCtx *gin.Context) {
	selectedFile, err := ctx.GetSelectedFile()
	if err != nil {
		svrCtx.Error(err)(ginCtx)
		return
	}

	if selectedFile == nil {
		ginCtx.String(http.StatusNotFound, "content not found")
		return
	}

	if selectedFile.DownloadedCount >= ctx.DownloadLimit {
		ginCtx.String(http.StatusForbidden, "download limit exceeded")
		return
	}

	downloadURL, err := url.Parse(selectedFile.SourceURL)
	if err != nil {
		svrCtx.Error(err)(ginCtx)
		return
	}

	req, err := http.NewRequest("GET", downloadURL.String(), nil)
	if err != nil {
		svrCtx.Error(err)(ginCtx)
		return
	}

	req.Header.Add("Accept", ginCtx.Request.Header.Get("Accept"))
	req.Header.Add("Accept-Encoding", ginCtx.Request.Header.Get("Accept-Encoding"))
	req.Header.Add("Accept-Language", ginCtx.Request.Header.Get("Accept-Language"))
	req.Header.Add("Accept-Charset", ginCtx.Request.Header.Get("Accept-Charset"))
	req.Header.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36")

	if ginCtx.Request.Header.Get("Range") != "" {
		req.Header.Add("Range", ginCtx.Request.Header.Get("Range"))
	}

	res, err := HTTPClient.Do(req)
	if err != nil {
		svrCtx.Error(err)(ginCtx)
		return
	}
	defer res.Body.Close()

	if res.Header.Get("Content-Length") != "" {
		ctx.DownloadedSize, err = strconv.ParseInt(res.Header.Get("Content-Length"), 10, 64)
	} else {
		ctx.DownloadedSize = 0
	}

	if err != nil {
		svrCtx.Error(err)(ginCtx)
		return
	}

	ginCtx.Writer.Header().Set("Accept-Ranges", "bytes")

	if ginCtx.Request.URL.Query().Get("mime") == "" {
		fileName, err := ctx.GetFileName(selectedFile.FileName)
		if err != nil {
			svrCtx.Error(err)(ginCtx)
			return
		}

		fileExt, err := ctx.GetFileExt(selectedFile.FileName)
		if err != nil {
			svrCtx.Error(err)(ginCtx)
			return
		}

		ginCtx.Writer.Header().Set("Content-Disposition", "attachment; filename="+fileName+fileExt)
	}

	for key, value := range res.Header {
		if key == "Content-Disposition" {
			continue
		}
		ginCtx.Writer.Header().Set(key, value[0])
	}

	// Support DLNA streaming
	ginCtx.Writer.Header().Set("transferMode.dlna.org", "Streaming")
	ginCtx.Writer.Header().Set("contentFeatures.dlna.org", "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000")

	if ginCtx.Request.Header.Get("Range") != "" {
		ginCtx.Status(http.StatusPartialContent)
	}

	bucket := ratelimit.NewBucketWithRate(float64(256000), 256000)
	io.Copy(ginCtx.Writer, ratelimit.Reader(res.Body, bucket))
	defer ginCtx.Request.Body.Close()

	err = ctx.FinalizeDownload(selectedFile)

	if err != nil {
		svrCtx.Error(err)(ginCtx)
		return
	}
}

// FinalizeDownload comment
func (ctx *DownloadSession) FinalizeDownload(selectedFile *FileInfo) error {
	var (
		err error
		ok  bool
	)
	downloadedCount := selectedFile.DownloadedCount + 1

	fileKeyName := BuildString("download", ":", ctx.ID, ":", ctx.FileKey)
	fileName := ctx.conn.HMSet(context.TODO(), fileKeyName, "downloadedCount", downloadedCount)
	if err = fileName.Err(); err != nil {
		return err
	}
	ok, err = fileName.Result()
	if err != nil {
		return err
	}
	if !ok {
		err = errors.New("unable to complete download session")
	}
	return err
}
