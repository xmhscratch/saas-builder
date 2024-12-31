package core

import (
	"errors"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// CreateAPIRequest comment
func CreateAPIRequest(cfg *Config, userID string, organizationID string, method string, urlString string, data *url.Values) (err error) {
	u, err := url.Parse(urlString)
	if err != nil {
		return err
	}

	apiRequest := &APIRequest{
		cfg:            cfg,
		UserID:         userID,
		OrganizationID: organizationID,
		URL:            u,
		PostData:       data,
	}

	ch := make(chan error)
	go apiRequest.makeRequest(method, ch)
	if err := <-ch; err != nil {
		return err
	}

	return err
}

// makeRequest comment
func (ctx *APIRequest) makeRequest(method string, ch chan error) {
	if ctx.PostData == nil {
		ctx.PostData = &url.Values{}
	}
	if method == "" {
		method = "POST"
	}

	req, err := http.NewRequest(method, ctx.URL.String(), strings.NewReader(ctx.PostData.Encode()))
	if err != nil {
		ch <- err
		return
	}

	req.Header.Set("x-user-id", ctx.UserID)
	req.Header.Set("x-organization-id", ctx.OrganizationID)
	req.Header.Set("content-type", "application/x-www-form-urlencoded")

	client := &http.Client{
		Timeout: time.Second * 15,
		Transport: &http.Transport{
			Dial: (&net.Dialer{
				Timeout: 5 * time.Second,
			}).Dial,
			TLSHandshakeTimeout: 5 * time.Second,
		},
	}

	resp, err := client.Do(req)
	if err != nil {
		ch <- err
		return
	}
	defer resp.Body.Close()

	if ch <- err; ch == nil {
		if resp.StatusCode != 200 {
			ch <- errors.New("Request returned error")
		}
	}
}
