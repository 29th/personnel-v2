# Personnel API

## Installation Instructions

### Install Dependencies
Install [Composer](http://getcomposer.org) (Detailed instructions available for [Linux](https://getcomposer.org/doc/00-intro.md#installation-nix) and [Windows](https://getcomposer.org/doc/00-intro.md#installation-windows))
1. Download and install composer inside any directory via `curl -sS https://getcomposer.org/installer | php`
2. Make the install global via `mv composer.phar /usr/local/bin/composer`

### Install the Application
1. Navigate to your public/www directory and `git clone https://github.com/29th/personnel-api.git`
2. Navigate inside the `personnel_api` directory and install dependencies via `composer install`

At this point if you view the application in the browser you should get a database error.

### Create the Database
This repository comes with `personnel_v2.sql`, containing the structure only (no contents/records) of the database. Alternatively, you can obtain an export of the production database from an administrator.
1. Create your own MySQL database for this application
2. Load in the `personnel_v2.sql` file (or the export you obtained) via `mysql -u [username] -p [database name] < personnel_v2.sql`

### Set Environment Variables
Rather than storing secret credentials in PHP files that might accidentally be committed to source control and leaked publicly, sensitive information is accessed via environment variables. Environment variables can be set in various ways depending on the system and environment. A list of the environment variables is provided in `.env.sample`. Some of the values you can fill in yourself; others will have to be obtained from a system administrator if you want to connect to a production system.

Once the values are filled in, the easiest way to install them, if you're running apache, is to create an `.htaccess` file *above* this application's directory (ie. if the application is installed to `/var/www/personnel-api` you would create `/var/www/.htaccess`. This is because the repository already contains its own `.htaccess` file that you would not want to overwrite as it is part of the source control.

Inside the `.htaccess` file, format the environment variables like this:
```
SetEnv VARIABLE1_NAME 'value1'
SetEnv VARIABLE2_NAME 'value2'
```
At this point you should now be able to load the application in the browser, with a message of `{"status":true,"message":"Welcome to the API. Enjoy yourself, and good luck getting around. CI v2.1.4"}`

### Copy Cookie
By default, you will be able to interact with the API like a public user. To log in, you'll need it to be able to see your forum cookie. This application uses the same cookie as the forum it's connected to. Since you'll be running this locally, that cookie won't be shared with this application (the forum is on a different domain than your local environment). To leverage this cookie, go to the forum and copy the value of the `Vanilla` cookie (using something like [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg)), then create one when viewing your local application in the browser. Name it `Vanilla` and paste the value in. For this to work, you'll have to have the correct details filled out in your environment variables for the cookie.

Alternatively, you can install your own local version of [Vanilla Forums](http://vanillaforums.org/) and use its cookie. If it's running on the same domain, you won't need to "copy the cookie."

## Troubleshooting
### Make sure `mod_rewrite` is enabled
Many apache servers have `mod_rewrite` disabled by default. It's required to allow URL routing in `.htaccess` files. Enter `a2enmod rewrite` and then `sudo service apache2 restart` to restart apache

### Make sure `AllowOverride` is enabled
This setting is required to allow `.htaccess` files in directories to overwrite default apache settings. Modify apache's primary `.conf` file, typically `/etc/apache2/httpd.conf` and make sure for the public `<Directory>` tag that `AllowOverride` is set to `All` instead of `None`