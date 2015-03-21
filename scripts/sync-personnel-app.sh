DIR_CWD=$1

echo 'Syncing personnel-app...'
(cd ${DIR_REPOS}personnel-app &&
CURRENT_BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p') &&
git fetch upstream &&
git checkout master &&
git merge upstream/master
git checkout $CURRENT_BRANCH)
echo 'Finished syncing personnel-app'