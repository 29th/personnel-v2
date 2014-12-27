#!/bin/bash

export DEBIAN_FRONTEND=noninteractive
add-apt-repository ppa:chris-lea/node.js
apt-get update && apt-get install -y git nodejs
# Don't apt-get upgrade http://stackoverflow.com/a/15093460/589391

# Limit mysql memory use for install
# https://mariadb.com/blog/starting-mysql-low-memory-virtual-machines
mkdir -p /etc/mysql/conf.d
cat > /etc/mysql/conf.d/low_mem.cnf << 'EOF'
[mysqld]
performance_schema = off
EOF

echo 'Installing LAMP...'
apt-get install -y lamp-server^

echo 'Creating databases...'
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS personnel_v2"
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS vanilla"
mysql -uroot personnel_v2 < /vagrant/personnel_v2_sample.sql

echo 'Configuring web server...'

# Install .htaccess
ln -s /vagrant/.htaccess /var/www/html/
sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf
a2enmod rewrite
service apache2 restart

echo 'Installing composer...'
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Remove previous installation
rm -rf /vagrant/repositories

echo 'Installing personnel-api...'
git clone https://github.com/29th/personnel-api.git /vagrant/repositories/personnel-api
ln -s /vagrant/repositories/personnel-api /var/www/html/

echo 'Installing Vanilla...'
git clone --recursive -b 29th-extensions https://github.com/29th/vanilla.git /vagrant/repositories/forums
chmod -R 777 /vagrant/repositories/forums/conf
chmod -R 777 /vagrant/repositories/forums/uploads
chmod -R 777 /vagrant/repositories/forums/cache
ln -s /vagrant/config.php /vagrant/repositories/forums/conf/
chmod 777 /vagrant/config.php
ln -s /vagrant/repositories/forums /var/www/html/

echo 'Installing theme...'
git clone https://github.com/29th/vanilla-bootstrap.git /vagrant/repositories/bootstrap
ln -s /vagrant/repositories/bootstrap /vagrant/repositories/forums/themes/

echo 'Installing personnel app...'
git clone https://github.com/29th/personnel-app.git /vagrant/repositories/personnel-app
ln -s /vagrant/repositories/personnel-app /var/www/html/

echo 'Installing personnel-api dependencies...'
composer install -d /vagrant/repositories/personnel-api

echo 'Installing personnel front-end dependencies...'
cd /vagrant/repositories/personnel-app
npm install
./node_modules/bower/bin/bower install --allow-root

echo 'Installation complete! Browse to http://localhost:8080/personnel-app/app'