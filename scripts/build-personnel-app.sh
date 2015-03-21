DIR_CWD=$1

echo 'Building personnel front-end...'
(cd ${DIR_CWD}personnel-app && npm run build)