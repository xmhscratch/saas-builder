#!/bin/bash

MYSQL_HOST=mariadb_master
MYSQL_USER=root
MYSQL_PASSWORD=mCWDtkT6h9NMHsZq

tables=()
while getopts d:t:e: flag
do
    case "${flag}" in
        d) database=${OPTARG};;
        t) tables+=$(echo "${OPTARG} ");;
        e) exportDir=${OPTARG};;
    esac
done

database=${database:-"system_core"};
tables=(${tables[@]})
exportDir=${exportDir:-"./schema"};

# echo $database;
# echo $tables;
# echo $exportDir;

for table in ${tables[@]}; do
    ./node_modules/.bin/sequelize-auto \
        -o $exportDir \
        -d $database \
        -h $MYSQL_HOST \
        -u $MYSQL_USER \
        -p 3306 \
        -x $MYSQL_PASSWORD \
        -e mysql \
        -t $table \
        --noInitModels true \
        --caseModel p \
        --caseProp c \
        --caseFile k \
        --lang es5 \
        --singularize true \
        --indentation 4 \
        ;
done
