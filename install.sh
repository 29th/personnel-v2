DIR_SCRIPTS=scripts/
DIR_REPOS=repositories/
HOSTNAME=${1-localhost}
USERNAME=${2-root}

# Configure .htaccess
. ${DIR_SCRIPTS}configure-htaccess.sh $HOSTNAME $USERNAME

# Create databases
. ${DIR_SCRIPTS}create-databases.sh $HOSTNAME $USERNAME

# Install personnel-api
. ${DIR_SCRIPTS}install-personnel-api.sh $DIR_REPOS

# Install personnel-app
. ${DIR_SCRIPTS}install-personnel-app.sh $DIR_REPOS

# Install vanilla
. ${DIR_SCRIPTS}install-vanilla.sh $DIR_REPOS

# Configure vanilla
cp config.base.php ${DIR_REPOS}forums/conf/config.php
chmod 777 ${DIR_REPOS}forums/conf/config.php

echo 'Installation complete!'