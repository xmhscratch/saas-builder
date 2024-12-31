# build stage
FROM localhost:5000/sysenv:latest AS builder
WORKDIR /go/src/localdomain/webhook/
ENV GIT_SSL_NO_VERIFY 1
ENV GO111MODULE "on"
COPY . .
RUN \
    apk add --virtual .build-deps \
        curl \
        alpine-sdk \
        git; \
    \
    go get -d -v ./...; \
    go install -v ./...; \
    go mod vendor; \
    go build -mod=vendor -o /go/bin/webhook .; \
    # cleanup
    apk del .build-deps; \
    rm -rf /var/cache/apk/*; \
    rm -rf /tmp/*;

#final stage
FROM localhost:5000/sysenv:latest
WORKDIR /export/
# LABEL Name=webhook Version=1.0.0
ENV GIT_SSL_NO_VERIFY 1
ENV GO111MODULE "on"
ENV GO_ENV development
COPY --from=builder /go/bin/webhook /export/webhook
EXPOSE 3800
ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "/export/webhook" ]
