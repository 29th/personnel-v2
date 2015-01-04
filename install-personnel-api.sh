DIR_CWD=$1

# Check if composer is installed
if [ ! -f /usr/local/bin/composer ]; then
    echo 'Installing composer...'
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
else
    echo 'Composer already installed'
fi

echo 'Installing personnel-api...'
git clone https://github.com/29th/personnel-api.git ${DIR_CWD}personnel-api

echo 'Installing personnel-api dependencies...'
composer install -d ${DIR_CWD}personnel-api
