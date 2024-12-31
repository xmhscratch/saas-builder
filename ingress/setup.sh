#!/bin/bash

yum update
yum install -y pcre-devel openssl-devel gcc curl
yum install -y yum-utils
yum-config-manager --add-repo https://openresty.org/package/centos/openresty.repo
yum install openresty openresty-resty

systemctl enable openresty;
systemctl start openresty;

ENV_NAME=production
cp -rf $(pwd)conf/* /usr/local/openresty/nginx/conf/
