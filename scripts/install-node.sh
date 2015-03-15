#add-apt-repository -y ppa:chris-lea/node.js
#curl -sL https://deb.nodesource.com/setup | sudo bash -
#apt-get update && apt-get install -y git nodejs

#cd /home/vagrant

# Installing nvm
wget -qO- https://raw.github.com/creationix/nvm/master/install.sh | sh

# This enables NVM without a logout/login
export NVM_DIR="/home/vagrant/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

# Install a node and alias
nvm install 0.10.33
nvm alias default 0.10.33