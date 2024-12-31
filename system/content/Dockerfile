# build stage
FROM localhost:5000/sysenv:latest AS builder
WORKDIR /go/src/localdomain/content/
ENV GO111MODULE on
ENV GIT_SSL_NO_VERIFY 1
COPY . .
RUN apk add --no-cache alpine-sdk git
RUN \
    apk add --virtual .build-deps \
        curl \
        alpine-sdk \
        git; \
    \
    go get -d -v ./...; \
    go install -v ./...; \
    go mod vendor; \
    go build -mod=vendor -o /go/bin/content .; \
    # cleanup
    apk del .build-deps; \
    rm -rf /var/cache/apk/*; \
    rm -rf /tmp/*;

# final stage
FROM localhost:5000/sysenv:latest
WORKDIR /export/
# LABEL Name=content Version=1.0.0
ENV GO_ENV development
ENV GIN_MODE debug
ENV GO111MODULE on
ENV GIT_SSL_NO_VERIFY 1
COPY --from=builder /go/bin/content /export/content
EXPOSE 3552
ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "/export/content" ]
