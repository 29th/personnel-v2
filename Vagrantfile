# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
    config.vm.box = "ubuntu/trusty32"
    
    #config.vm.provider "docker" do |d|
    #    d.image = "tutum/lamp:latest"
    #    d.has_ssh = true
    #end
    
    config.vm.provider :virtualbox do |vb|
        vb.gui = true
        vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant-root", "1"] # necessary for symlinks on windows
    end
    
    config.vm.provider "lxc" do |lxc, override|
        override.vm.box = "fgrehm/trusty64-lxc"
    end
    
    config.vm.network "forwarded_port", guest: 80, host: 8080
    config.vm.provision "shell", path: "bootstrap.sh"
end
