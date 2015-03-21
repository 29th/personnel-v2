CURRENT_BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
git fetch upstream
git merge upstream/$CURRENT_BRANCH