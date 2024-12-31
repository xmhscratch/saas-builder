FROM localhost:5000/sysenv:latest

USER root

ENV NODE_ENV development
ENV OPENCV_INCLUDE_DIR /usr/include/opencv
ENV OPENCV_LIB_DIR /usr/lib
ENV OPENCV_BIN_DIR /usr/bin
ENV OPENCV4NODEJS_DISABLE_AUTOBUILD 1
ENV OPENCV4NODEJS_AUTOBUILD_OPENCV_VERSION=3.4.16

RUN \
    apk add --virtual .build-deps \
        autoconf \
        automake \
        alpine-sdk \
        binutils-gold \
        build-base \
        cmake \
        gnu-libiconv \
        gnu-libiconv-dev \
        gnupg \
        libgcc \
        libressl-dev \
        libtool \
        linux-headers \
        libstdc++ \
        make \
        pkgconf \
        pkgconf-dev; \
    \
    # install node_modules
    cd /export; \
    chown -R www-data:www-data /export/; \
    \
    su -s /bin/sh www-data -c "npm install --no-package-lock --no-save --global gm"; \
    su -s /bin/sh www-data -c "npm install --no-package-lock --no-save --global bcrypt"; \
    su -s /bin/sh www-data -c "npm install --no-package-lock --no-save --global better-sqlite3"; \
    su -s /bin/sh www-data -c "npm install --no-package-lock --no-save --global @u4/opencv4nodejs"; \
    \
    # cleanup
    su -s /bin/sh www-data -c "npm cache clean --force"; \
    apk del .build-deps; \
    rm -rf /var/cache/apk/*; \
    rm -rf /tmp/*;

WORKDIR /export
ENTRYPOINT [ "/bin/sh", "-c" ]
