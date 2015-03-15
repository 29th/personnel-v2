# Check if composer is installed
if [ ! -f /usr/local/bin/composer ]; then
    echo 'Installing composer...'
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
else
    echo 'Composer already installed'
fi