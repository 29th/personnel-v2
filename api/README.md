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
1. While inside your new `personnel-api` directory, use `git init`
2. `git remote add origin git@github.com:29th/personnel-api.git`
3. `git pull origin master`
4. Navigate *above* the `personnel-api` directory and create an `.htaccess` file (or modify an existing one) and add the secret environment variables

```
SetEnv PERSONNEL_DB_DEFAULT 'xxx'
SetEnv PERSONNEL_DB_FORUMS 'xxx'
SetEnv PERSONNEL_VANILLA_COOKIE 'xxx'
SetEnv PERSONNEL_ENCRYPTION_KEY 'xxx'
```
## Copy Cookie
This application uses the same cookie as the forum it's connected to. Since you'll be running this locally, that cookie won't be shared with this application (the forum is on a different domain than your local environment). To leverage this cookie, go to the forum and copy the value of the `Vanilla` cookie (using something like [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg)), then create one when viewing your local application in the browser. Name it `Vanilla` and paste the value in.
