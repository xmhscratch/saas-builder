#!/bin/sh
set -eu

# ln -sf /node_modules/node_modules $(realpath /${SOURCE_CODE_PATH}/)
# ln -sf /node_modules/package-lock.json $(realpath /${SOURCE_CODE_PATH}/)

# echo "ln -sf /node_modules/node_modules $(realpath /${SOURCE_CODE_PATH}/)"
# echo "ln -sf /node_modules/package-lock.json $(realpath /${SOURCE_CODE_PATH}/)"
# echo "$(realpath /${SOURCE_CODE_PATH}/)/services/${APP_NAME}/index.js"

# ls -la $(realpath /${SOURCE_CODE_PATH}/)

exec "$@"
