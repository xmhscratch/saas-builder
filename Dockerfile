FROM localhost:5000/microservice:latest

COPY package.json ./

EXPOSE \
    # account
    3010 \
    # api
    3500 \
    # app
    3000 \
    # asset
    3100 3150 \
    # asset-vendor
    3110 3115 \
    # integration
    3600 \
    # download
    3550 \
    # photo
    3560 \
    # invoice
    3510 \
    # stats
    3588 \
    # storage
    5030 \
    # transmitter
    3590 \
    # widget
    3540

# ENTRYPOINT ["su", "-s", "/bin/sh", "www-data", "-c"]
CMD [ "node /export/index.js" ]
