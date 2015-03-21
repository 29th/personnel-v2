DIR_CWD=$1
GITHUB_USER=${2-29th}

echo 'Installing personnel-api...'
git clone https://github.com/${GITHUB_USER}/personnel-api.git ${DIR_CWD}personnel-api

if ["$GITHUB_USER" != "29th"]; then
    echo 'Adding upstream remote...'
    (cd ${DIR_CWD} && git remote add upstream https://github.com/29th/personnel-api.git)
fi

echo 'Installing personnel-api dependencies...'
composer install -d ${DIR_CWD}personnel-api
