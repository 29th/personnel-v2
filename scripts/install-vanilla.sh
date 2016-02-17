DIR_CWD=$1
GITHUB_USER=${2-29th}

echo 'Installing Vanilla...'
git clone --recursive -b 29th-extensions-2.1.11 https://github.com/${GITHUB_USER}/vanilla.git ${DIR_CWD}forums
#(cd ${DIR_CWD}forums && git checkout 29th-extensions && git submodule update --init --recursive)

if [ "$GITHUB_USER" != "29th" ]; then
    echo 'Adding upstream remote...'
    (cd ${DIR_CWD}forums && git remote add upstream https://github.com/29th/vanilla.git)
fi

chmod -R 777 ${DIR_CWD}forums/conf
chmod -R 777 ${DIR_CWD}forums/cache
chmod -R 777 ${DIR_CWD}forums/uploads
