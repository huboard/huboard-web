# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "puppetlabs/ubuntu-14.04-64-puppet"
  config.vm.box_version = "= 1.0.1"

  config.vm.provider :virtualbox do |vb|
    # Uncomment to assist with debugging:
    # vb.gui = true
  end

  config.vm.synced_folder ".", "/srv/huboard", type: "nfs"
  config.vm.network "private_network", ip: "192.168.50.10"

  #Rails
  config.vm.network "forwarded_port", guest: 3000, host: 3001

  #CouchDB Futon
  config.vm.network "forwarded_port", guest: 5984, host: 5984

  #Redis
  config.vm.network "forwarded_port", guest: 6379, host: 6379

  #Mailcatcher
  config.vm.network "forwarded_port", guest: 1080, host: 1080

  config.vm.provision "puppet", :module_path => [ "puppet/modules","puppet/local_modules" ] do |puppet|
    puppet.manifests_path = "puppet/manifests"
    puppet.manifest_file  = "base.pp"
    #puppet.options = "--verbose --debug"
  end
end
