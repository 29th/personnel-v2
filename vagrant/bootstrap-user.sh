#!/bin/bash
DIR_PUBLIC_HTML=/var/www/html/ # Is this available as an apache env var?
DIR_CWD=/vagrant/
DIR_REPOS=/home/vagrant/Sites/

# Install Node.js
. ${DIR_CWD}scripts/install-node.sh

# Remove previous installation
#rm -rf $DIR_REPOS
mkdir -p $DIR_REPOS

# Install personnel-api
#bash ${DIR_CWD}scripts/install-personnel-api.sh $DIR_REPOS
#sudo ln -sf ${DIR_REPOS}personnel-api $DIR_PUBLIC_HTML

# Install personnel-app
. ${DIR_CWD}scripts/install-personnel-app.sh $DIR_REPOS
sudo ln -sf ${DIR_REPOS}personnel-app $DIR_PUBLIC_HTML

# Install vanilla
#sudo bash ${DIR_CWD}scripts/install-vanilla.sh $DIR_REPOS
#cp ${DIR_CWD}config.base.php ${DIR_REPOS}/forums/conf/config.php
#chmod 777 ${DIR_REPOS}/forums/conf/config.php
#ln -sf ${DIR_REPOS}forums $DIR_PUBLIC_HTML

echo 'Installation complete! Browse to http://localhost:8080/forums/dashboard/setup'