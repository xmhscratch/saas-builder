#!/bin/bash
set -eu

if [ "$CLUSTER_ROLE" ] && [ "$CLUSTER_ROLE" = "slave" ]; then
    rabbitmq-server -detached
    /bin/bash -c "sleep 30"
    /bin/bash -c "rabbitmqctl stop_app"
    /bin/bash -c "rabbitmqctl join_cluster \"$CLUSTER_WITH\""
    /bin/bash -c "rabbitmqctl stop"
    /bin/bash -c "sleep 5"
    rabbitmq-server
else
    # rabbitmq-server -detached
    # /bin/bash -c "sleep 5"
    # /bin/bash -c "rabbitmqctl -n $RABBITMQ_NODENAME add_user $RABBITMQ_DEFAULT_USER $RABBITMQ_DEFAULT_PASS"
    # /bin/bash -c "rabbitmqctl set_user_tags $RABBITMQ_DEFAULT_USER administrator"
    # /bin/bash -c "rabbitmqctl set_permissions -p / $RABBITMQ_DEFAULT_USER '.*' '.*' '.*'"
    # /bin/bash -c "rabbitmqctl stop"
    # /bin/bash -c "sleep 5"
    rabbitmq-server
fi

exec "$@"
