DIR_REPOS=repositories/
DIR_SCRIPTS_FROM_REPOS=../../scripts/

echo 'Syncing personnel-app...'
(cd ${DIR_REPOS}personnel-app && . ${DIR_SCRIPTS_FROM_REPOS}sync-repo.sh)

echo 'Syncing personnel-api...'
(cd ${DIR_REPOS}personnel-api && . ${DIR_SCRIPTS_FROM_REPOS}sync-repo.sh)

echo 'Syncing forums...'
(cd ${DIR_REPOS}forums && . ${DIR_SCRIPTS_FROM_REPOS}sync-repo.sh)