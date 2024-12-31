FROM rabbitmq:3.8.17-management-alpine

WORKDIR /opt

ENV CLUSTER_ROLE master
ENV CLUSTER_WITH rbmq@svc

COPY [ "bootrap.sh", "./" ]
RUN chmod +x bootrap.sh

ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD /opt/bootrap.sh
