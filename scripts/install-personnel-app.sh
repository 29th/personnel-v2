DIR_CWD=$1

echo 'Installing personnel app...'
git clone https://github.com/29th/personnel-app.git ${DIR_CWD}personnel-app

echo 'Installing personnel front-end dependencies...'
(cd ${DIR_CWD}personnel-app && npm install)

echo 'Building personnel front-end...'
(cd ${DIR_CWD}personnel-app && npm run build)
