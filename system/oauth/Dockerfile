# build stage
FROM localhost:5000/sysenv:latest AS builder
WORKDIR /go/src/localdomain/oauth/
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
    go build -mod=vendor -o /go/bin/oauth .; \
    # cleanup
    apk del .build-deps; \
    rm -rf /var/cache/apk/*; \
    rm -rf /tmp/*;

# final stage
FROM localhost:5000/sysenv:latest
WORKDIR /export/
# LABEL Name=localdomain.oauth Version=0.0.1
ENV GO_ENV development
COPY --from=builder /go/bin/oauth /export/oauth
COPY ["config.*.json", "/export/"]
EXPOSE 3999
ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "/export/oauth" ]
