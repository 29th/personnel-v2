DIR_CWD=$1

echo 'Syncing personnel-api...'
(cd ${DIR_REPOS}personnel-api &&
CURRENT_BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p') &&
git fetch upstream &&
git checkout master &&
git merge upstream/master
git checkout $CURRENT_BRANCH)
echo 'Finished syncing personnel-api'