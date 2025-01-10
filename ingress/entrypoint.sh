#!/bin/bash
set -eu

dirPaths=(
    "/tmp/ingress/"
    "/tmp/ingress/cache/"
)

for dirPath in "${dirPaths[@]}"
do
    if [[ ! -e $dirPath ]]; then
        mkdir -p $dirPath
    elif [[ ! -d $dirPath ]]; then
        echo "$dirPath already exists" 1>&2
    fi
done

cp -vf /usr/local/openresty/nginx/conf/certs.d/ca.crt /etc/pki/ca-trust/source/anchors/ca.crt
update-ca-trust force-enable
update-ca-trust extract

# curl -k -I -v --tlsv1.2 --tls-max 1.2 https://localhost/

exec "$@"
