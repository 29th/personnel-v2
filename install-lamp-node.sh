export DEBIAN_FRONTEND=noninteractive
#add-apt-repository -y ppa:chris-lea/node.js
curl -sL https://deb.nodesource.com/setup | sudo bash -
apt-get update && apt-get install -y git nodejs
# Don't apt-get upgrade http://stackoverflow.com/a/15093460/589391
# Limit mysql memory use for install
# https://mariadb.com/blog/starting-mysql-low-memory-virtual-machines
mkdir -p /etc/mysql/conf.d
cat > /etc/mysql/conf.d/low_mem.cnf << 'EOF'
[mysqld]
performance_schema = off
max_connections = 20
EOF
touch /etc/apparmor.d/local/usr.sbin.mysqld

echo 'Installing LAMP...'
apt-get install -y lamp-server^
