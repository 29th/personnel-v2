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

echo 'Configuring web server...'
sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf
a2enmod rewrite
service apache2 restart
