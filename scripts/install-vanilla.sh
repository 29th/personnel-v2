DIR_CWD=$1

echo 'Installing Vanilla...'
git clone --recursive -b 29th-extensions-2.1.8p2 https://github.com/29th/vanilla.git ${DIR_CWD}forums
#(cd ${DIR_CWD}forums && git checkout 29th-extensions && git submodule update --init --recursive)
chmod -R 777 ${DIR_CWD}forums/conf
chmod -R 777 ${DIR_CWD}forums/cache
chmod -R 777 ${DIR_CWD}forums/uploads
