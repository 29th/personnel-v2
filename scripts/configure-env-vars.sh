HOSTNAME=${1-localhost}
USERNAME=${2-root}
REPOSITORIES=${3-/}

echo 'Configuring personnel-api environment variables'
cp .htaccess.sample .htaccess
sed -i "s/DB_DEFAULT_USERNAME '.*'/DB_DEFAULT_USERNAME '$USERNAME'/g" .htaccess
sed -i "s/DB_DEFAULT_HOSTNAME '.*'/DB_DEFAULT_HOSTNAME '$HOSTNAME'/g" .htaccess
sed -i "s/DB_FORUMS_USERNAME '.*'/DB_FORUMS_USERNAME '$USERNAME'/g" .htaccess
sed -i "s/DB_FORUMS_HOSTNAME '.*'/DB_FORUMS_HOSTNAME '$HOSTNAME'/g" .htaccess

echo 'Configuring personnel-app environment variables'
export BASE_URL=${REPOSITORIES}personnel-app
export API_HOST=${REPOSITORIES}personnel-api
export COAT_DIR=${REPOSITORIES}personnel-api/coats
export FORUM_VANILLA_BASE_URL=${REPOSITORIES}forums
export FORUM_SMF_BASE_URL=http://29th.org/forums
export WIKI_URL=http://29th.org/wiki