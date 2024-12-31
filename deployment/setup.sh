#!/bin/bash

# swap memory
swapon -s
dd if=/dev/zero of=/swapfile count=4096 bs=512 status=progress
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
cat <<EOT >> /etc/fstab
/swapfile   none    swap    sw    0   0
EOT

ssh-keygen -t rsa

sestatus
sed -i s/^SELINUX=.*$/SELINUX=disabled/ /etc/selinux/config
# sed -i s/^SELINUX=.*$/SELINUX=enforcing/ /etc/selinux/config
reboot

cat <<EOF >> /etc/sysconfig/network-scripts/ifcfg-eth0
PEERDNS=no
DNS1=127.0.0.1
DNS2=1.1.1.1
EOF

# IPADDR=$(ip -o -4 addr list eth1 | awk '{print $4}' | cut -d/ -f1)
cat <<EOF > /etc/sysconfig/network-scripts/ifcfg-eth1
DEVICE=eth1
ONBOOT=yes
BOOTPROTO=static
IPADDR=10.3.96.5
NETMASK=255.255.240.0
MTU=1450
EOF
service network restart

cat <<EOF > /etc/sysctl.conf
# Accept IPv6 advertisements when forwarding is enabled
net.ipv6.conf.all.accept_ra = 2
net.ipv6.conf.eth0.accept_ra = 2

net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.core.somaxconn = 65535

vm.overcommit_memory = 1
fs.inotify.max_user_watches=524288
fs.file-max = 524288

# This specifies an upper limit on the number of events that can be queued to the corresponding inotify instance. 1
fs.inotify.max_queued_events=1048576

# This specifies an upper limit on the number of inotify instances that can be created per real user ID. 1
fs.inotify.max_user_instances=1048576

# This specifies an upper limit on the number of watches that can be created per real user ID. 1
fs.inotify.max_user_watches=1048576

# This file contains the maximum number of memory map areas a process may have. Memory map areas are used as a side-effect of calling malloc, directly by mmap and mprotect, and also when loading shared libraries.
vm.max_map_count=262144

# This denies container access to the messages in the kernel ring buffer. Please note that this also will deny access to non-root users on the host system.
kernel.dmesg_restrict=1

# This is the maximum number of entries in ARP table (IPv4). You should increase this if you create over 1024 containers. Otherwise, you will get the error neighbour: ndisc_cache: neighbor table overflow! when the ARP table gets full and those containers will not be able to get a network configuration. 2
net.ipv4.neigh.default.gc_thresh3=8192

# This is the maximum number of entries in ARP table (IPv6). You should increase this if you plan to create over 1024 containers. Otherwise, you will get the error neighbour: ndisc_cache: neighbor table overflow! when the ARP table gets full and those containers will not be able to get a network configuration. 2
net.ipv6.neigh.default.gc_thresh3=8192

# This is a limit on the size of eBPF JIT allocations which is usually set to PAGE_SIZE * 40000. When your kernel is compiled with CONFIG_BPF_JIT_ALWAYS_ON=y then /proc/sys/net/core/bpf_jit_enable is set to 1 and can't be changed. On such kernels the eBPF JIT compiler will treat failure to JIT compile a bpf program such as a seccomp filter as fatal when it would continue on another kernel. On such kernels the limit for eBPF jitted programs needs to be increased siginficantly.
net.core.bpf_jit_limit=3000000000

# This is the maximum number of keys a non-root user can use, should be higher than the number of containers
kernel.keys.maxkeys=2000

# This is the maximum size of the keyring non-root users can use
kernel.keys.maxbytes=2000000

# This is the maximum number of concurrent async I/O operations. You might need to increase it further if you have a lot of workloads that use the AIO subsystem (e.g. MySQL)
fs.aio-max-nr=524288
EOF

cat <<EOF > /etc/security/limits.conf
# maximum number of open files
*	    soft	nofile	    1048576	    unset

# maximum number of open files
*	    hard	nofile	    1048576	    unset

# maximum number of open files
root	soft	nofile	    1048576	    unset

# maximum number of open files
root	hard	nofile	    1048576	    unset

# maximum locked-in-memory address space (KB)
*	    soft	memlock	    unlimited	unset

# maximum locked-in-memory address space (KB)
*	    hard	memlock	    unlimited	unset

# maximum locked-in-memory address space (KB) (Only need with bpf syscall supervision)
root	soft	memlock	    unlimited	unset

# maximum locked-in-memory address space (KB) (Only need with bpf syscall supervision)
root	hard	memlock	    unlimited	unset
EOF

modprobe br_netfilter
sysctl -p
sysctl --system

# allow repository hosts
echo -e "Host github.com\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
echo -e "Host bitbucket.org\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config

# disable firewall
systemctl disable firewalld
systemctl stop firewalld

yum -y install nfs-utils

# disable rpcbind
systemctl stop rpcbind
systemctl stop rpcbind.socket
systemctl disable rpcbind
systemctl disable rpcbind.socket

yum -y upgrade
yum install -y epel-release
yum -y update
yum install -y wget nano curl htop iotop yum-plugin-versionlock
yum groupinstall -y "Development Tools"
yum install -y centos-release-scl
yum install -y devtoolset-8-gcc*
scl enable devtoolset-8 bash

yum install -y \
    cmake \
    cmake3 \
    python-devel \
    numpy \
    gcc gcc-c++ \
    gtk2-devel \
    libdc1394-devel \
    libv4l-devel \
    ffmpeg-devel \
    gstreamer-plugins-base-devel \
    libpng-devel \
    libjpeg-turbo-devel \
    jasper-devel \
    openexr-devel \
    libtiff-devel \
    libwebp-devel \
    tbb-devel \
    eigen3-devel

alternatives --install /usr/local/bin/cmake cmake /usr/bin/cmake 10 \
    --slave /usr/local/bin/ctest ctest /usr/bin/ctest \
    --slave /usr/local/bin/cpack cpack /usr/bin/cpack \
    --slave /usr/local/bin/ccmake ccmake /usr/bin/ccmake \
    --family cmake

alternatives --install /usr/local/bin/cmake cmake /usr/bin/cmake3 20 \
    --slave /usr/local/bin/ctest ctest /usr/bin/ctest3 \
    --slave /usr/local/bin/cpack cpack /usr/bin/cpack3 \
    --slave /usr/local/bin/ccmake ccmake /usr/bin/ccmake3 \
    --family cmake

cat <<EOF >> ~/.bashrc
bind '"\e[A": history-search-backward'
bind '"\e[B": history-search-forward'
source scl_source enable devtoolset-8
EOF
source ~/.bashrc

git config --global user.name "xmhscratch"
git config --global user.email "xmhscratch@gmail.com"

yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

systemctl disable docker
systemctl stop docker
yum versionlock delete docker*
# install docker & docker-compose
yum remove -y docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-selinux \
    docker-engine-selinux \
    docker-engine \
    docker-ce
rm -rf /etc/docker
rm -rf /var/lib/docker
rm -rf /usr/bin/docker*

# yum list docker-ce --showduplicates | sort -r
# DOCKER_VERSION=18.06.3.ce-3
DOCKER_VERSION=20.10.6-3
yum install -y --setopt=obsoletes=0 docker-ce-$DOCKER_VERSION.el7
yum versionlock docker-*
usermod -aG docker $USER

mkdir -p /etc/docker

curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

cat <<EOT > /etc/docker/daemon.json
{
    "insecure-registries": ["localhost:5000"]
}
EOT

# enable docker
systemctl enable docker
systemctl restart docker

mkdir -p /home/web/repos/localdomain/
chmod 775 /home/web/repos/localdomain/

# cat <<EOT > /home/web/mount.sh
# #!/usr/bin/env bash
# CMD="mfsmount -o defaults,rw,exec,mfsdelayedinit /home/web/data/ -f"
# if [ ! -z \${MASTER_HOST+X} ];
#     then
#         CMD="\$CMD -H \$MASTER_HOST"
# fi
# if [ ! -z \${MASTER_PORT+X} ];
#     then
#         CMD="\$CMD -P \$MASTER_PORT"
# fi
# exec \$CMD
# EOT
# chown root:root /home/web/mount.sh
# chmod 700 /home/web/mount.sh

yum update -y
yum install -y libpcap-devel fuse3-libs fuse3-devel fuse3 gnupg2 python3
modprobe fuse
lsmod | grep fuse

# mount -o nfsvers=3,defaults,rw,exec,soft,rsize=1048576,wsize=1048576,noatime,nofail,lookupcache=positive -t nfs 10.1.96.6:/home/web/repos/localdomain/services /mnt/test
# MASTER_HOST=127.0.0.1 nohup /home/web/mount.sh > /home/web/mount.out 2>&1 &
# MASTER_HOST=127.0.0.1 /home/web/mount.sh
# ps aux | grep -i mfsmount
# mfsmount -H 127.0.0.1 -o mfsmeta /mnt/mfsmeta
# mfsmount -H 127.0.0.1 -o big_writes,nosuid,nodev,rw,exec /home/web/data/

mkdir -p /home/web/data/
chmod -R 774 /home/web/data/

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.38.0/install.sh | bash
cat <<EOF >> ~/.bash_profile
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
EOF
source ~/.bash_profile
nvm install 14.20.0
nvm use 14.20.0

bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
source ~/.gvm/scripts/gvm
gvm install go1.4 -B
gvm use go1.4
export GOROOT_BOOTSTRAP=$GOROOT
gvm install go1.19
gvm use go1.19 --default

reboot -h 0

umount -f /home/web/data/
rm -rf /home/web/data/*

# cat <<EOF >> /etc/fstab
# 10.3.96.3:          /home/web/data/         nfs         defaults,rw,exec,mfsdelayedinit         0 0
# EOF
# mount -a

# umount -f /home/web/data/
# rm -rf /home/web/data/*
mkdir -p \
    /home/web/data/tmp/ \
    /home/web/data/system/ \
    /home/web/data/certs/ \
    /home/web/data/mongodb/ \
    /home/web/data/mariadb/ \
    /home/web/data/rabbitmq/ \
    /home/web/data/logstash/ \
    /home/web/data/elasticsearch/ \
    /home/web/data/solr/ \
    /home/web/data/zoo/ \
    /home/web/data/redis/ \
    /home/web/data/html/

mkdir -p \
    /home/web/data/mongodb/mongodb_data/ \
    /home/web/data/mongodb/mongodb_config/ \
    /home/web/data/mariadb/mariadb_data/ \
    /home/web/data/rabbitmq/rabbitmq_data/ \
    /home/web/data/solr/solr_solr_svc_data/ \
    /home/web/data/solr/solr_solr_svcn001_data/ \
    /home/web/data/solr/solr_solr_svcn002_data/ \
    /home/web/data/zoo/solr_zoo_svc_data/ \
    /home/web/data/zoo/solr_zoo_svcn001_data/ \
    /home/web/data/zoo/solr_zoo_svcn002_data/ \
    /home/web/data/redis/redis_data/

MARIADB_CONTAINER_ID=$(docker ps | grep 'mariadb_master.' | awk '{ print $1 }')
GRANT ALL PRIVILEGES ON *.* TO 'remote'@'%';
FLUSH PRIVILEGES;
docker exec -it $MARIADB_CONTAINER_ID sh -c 'exec mysqldump --all-databases --ignore-table=schema.information_schema --ignore-table=schema.mysql --ignore-table=schema.performance_schema --ignore-table=schema.test -uroot -p"mCWDtkT6h9NMHsZq"' > /home/all-databases.sql
docker cp /home/all-databases.sql  $MARIADB_CONTAINER_ID:/home/all-databases.sql
docker exec -it --user=root $MARIADB_CONTAINER_ID /bin/bash
mysql -uroot -p"mCWDtkT6h9NMHsZq" < /home/all-databases.sql
docker exec -it $MARIADB_CONTAINER_ID sh -c 'watch -n1 mysqladmin processlist -uroot -p"mCWDtkT6h9NMHsZq"'

RABBITMQ_CONTAINER_ID=$(docker ps | grep 'rabbitmq_svc.' | awk '{ print $1 }')
docker exec -it --user=root $RABBITMQ_CONTAINER_ID /bin/bash
rabbitmqctl -n $RABBITMQ_NODENAME add_user $RABBITMQ_DEFAULT_USER $RABBITMQ_DEFAULT_PASS
rabbitmqctl set_user_tags $RABBITMQ_DEFAULT_USER administrator
rabbitmqctl set_permissions -p / $RABBITMQ_DEFAULT_USER '.*' '.*' '.*'

# find /home/web/repos \( -type f ! -path "**/node_modules/*" \) -print0 | xargs -0 chmod 644
# find /home/web/repos \( -type d ! -path "**/node_modules/*" \) -print0 | xargs -0 chmod 755
# find /home/web/repos \( -type f -name "*.sh" ! -path "**/node_modules/*" \) -print0 | xargs -0 chmod +x
# type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@192.168.56.150 "cat >> /root/.ssh/authorized_keys"
# find ./ \( -type f ! -path "**/node_modules/*" \) -print0 | xargs -0 chmod 644
# find ./ \( -type d ! -path "**/node_modules/*" \) -print0 | xargs -0 chmod 755
