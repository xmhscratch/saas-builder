#!/bin/bash
# echo "$()" > .env
npmExec=$(which npm);
bash -c "$(echo \"${npmExec// /\\ }\") run start";
