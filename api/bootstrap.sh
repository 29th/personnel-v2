#/bin/sh
echo 'Installing Composer...'
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

echo 'Installing Dependencies...'
composer install

echo 'Finished Bootstrap'
