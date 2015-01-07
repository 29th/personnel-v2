#!/bin/bash
DIR_PUBLIC_HTML=/var/www/html/ # Is this available as an apache env var?
DIR_CWD=/vagrant/
DIR_REPOS=${DIR_CWD}repositories/

# Install LAMP and Node.js
sudo bash ${DIR_CWD}install-lamp-node.sh

# Configure web server
sudo bash ${DIR_CWD}configure-server.sh
ln -sf ${DIR_CWD}.htaccess $DIR_PUBLIC_HTML

# Create databases
sudo bash ${DIR_CWD}create-databases.sh $DIR_CWD

# Remove previous installation
rm -rf $DIR_REPOS

# Install personnel-api
sudo bash ${DIR_CWD}install-personnel-api.sh $DIR_REPOS
ln -sf ${DIR_REPOS}personnel-api $DIR_PUBLIC_HTML

# Install personnel-app
sudo bash ${DIR_CWD}install-personnel-app.sh $DIR_REPOS
ln -sf ${DIR_REPOS}personnel-app $DIR_PUBLIC_HTML

# Install vanilla
sudo bash ${DIR_CWD}install-vanilla.sh $DIR_REPOS
cp ${DIR_CWD}config.base.php ${DIR_REPOS}/forums/conf/config.php
chmod 777 ${DIR_REPOS}/forums/conf/config.php
ln -sf ${DIR_REPOS}forums $DIR_PUBLIC_HTML

echo 'Installation complete! Browse to http://localhost:8080/forums/dashboard/setup'