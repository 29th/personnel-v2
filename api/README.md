# Personnel API

## Configure Koding
1. Enable `mod_rewrite` using `sudo a2enmod rewrite`
2. Restart apache using `sudo service apache2 restart`

## Install CodeIgniter

1. Inside your public web directory, create a new directory using `mkdir personnel-api` and navigate inside it using `cd personnel-api`
2. Download the latest version of CodeIgniter using `wget http://ellislab.com/codeigniter/download`
2. Unzip it using `unzip download` (You can now delete the zip file using `rm download`)
4. Delete conflicting files using `rm .gitignore` and `rm -rf application`

## Install the Application
1. `git init`
2. `git remote add origin git@github.com:29th/personnel-api.git`
3. `git pull origin master`
4. Create `config/config.php` with contents obtained from repo author
5. Create `config/database.php` with contents obtained from repo author