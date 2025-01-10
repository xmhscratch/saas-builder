FROM openresty/openresty:centos

WORKDIR /export

ENV ENV_NAME=development
ENV LTD_DOMAIN=localhost
ENV CLUSTER_MASTER_SERVER=127.0.0.1
ENV ENABLE_PAGE_CACHE=1

COPY [ "conf/nginx.conf", "/usr/local/openresty/nginx/conf/" ]
COPY [ "conf/mime.types", "/usr/local/openresty/nginx/conf/" ]
COPY [ "entrypoint.sh", "/export/" ]

RUN \
    yum install -y epel-release; \
    yum -y update; \
    yum groups install -y "Development Tools"; \
    yum install -y \
        bash \
        ca-certificates \
        git \
        curl \
        openssl \
        openssl-devel \
        libevent-devel \
        libtermcap-devel \
        ncurses-devel \
        readline-devel \
        wget; \
    \
    cd /root/; \
    wget https://luarocks.org/releases/luarocks-3.9.1.tar.gz; \
    tar -zxpf luarocks-3.9.1.tar.gz; \
    cd ./luarocks-3.9.1; \
    ./configure \
        --prefix=/usr/local/openresty/luajit \
        --with-lua=/usr/local/openresty/luajit/ \
        --lua-suffix=jit \
        --with-lua-include=/usr/local/openresty/luajit/include/luajit-2.1; \
    make -j$(getconf _NPROCESSORS_ONLN); \
    make install; \
    \
    /usr/local/openresty/luajit/bin/luarocks install net-url; \
    \
    opm get openresty/lua-resty-mysql; \
    opm get openresty/lua-resty-redis; \
    opm get openresty/lua-resty-lrucache; \
    opm get openresty/lua-resty-dns; \
    \
    chmod u+x /export/entrypoint.sh; \
    \
    # cleanup
    rm -rf ../luarocks-3.9.1.tar.gz; \
    yum groups remove -y "Development Tools"; \
    yum clean all;

EXPOSE 80
ENTRYPOINT [ "/export/entrypoint.sh" ]
CMD ["/usr/bin/openresty", "-g", "daemon off;"]
