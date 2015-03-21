#!/bin/bash
DIR_PUBLIC_HTML=/var/www/html/ # Is this available as an apache env var?
DIR_CWD=/vagrant/
DIR_REPOS=/home/vagrant/Sites/

# Set non-interactive installation mode (used by apt-get)
export DEBIAN_FRONTEND=noninteractive

# Install Git
apt-get update && apt-get install -y git

# Install Node.js
#bash ${DIR_CWD}scripts/install-node.sh

# Install LAMP
. ${DIR_CWD}scripts/install-lamp.sh
#ln -sf ${DIR_CWD}.htaccess $DIR_PUBLIC_HTML

# Install Composer
. ${DIR_CWD}scripts/install-composer.sh

# Create databases
#. ${DIR_CWD}scripts/create-databases.sh $DIR_CWD