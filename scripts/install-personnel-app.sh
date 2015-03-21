DIR_CWD=$1
GITHUB_USER=${2-29th}

echo 'Installing personnel app...'
git clone https://github.com/${GITHUB_USER}/personnel-app.git ${DIR_CWD}personnel-app

if [ "$GITHUB_USER" != "29th" ]; then
    echo 'Adding upstream remote...'
    (cd ${DIR_CWD} && git remote add upstream https://github.com/29th/personnel-app.git)
fi

echo 'Installing personnel front-end dependencies...'
(cd ${DIR_CWD}personnel-app && npm install)

echo 'Building personnel front-end...'
(cd ${DIR_CWD}personnel-app && npm run build)
