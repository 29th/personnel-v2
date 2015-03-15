DIR_CWD=$1

echo 'Installing personnel-api...'
git clone https://github.com/29th/personnel-api.git ${DIR_CWD}personnel-api

echo 'Installing personnel-api dependencies...'
composer install -d ${DIR_CWD}personnel-api
