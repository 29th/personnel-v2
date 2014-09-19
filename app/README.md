# Personnel System

## Installation

First, make sure you have [node.js](http://nodejs.org/) with npm installed.

1. Clone the repository by using `git clone git@github.com:29th/personnel.git`
2. Navigate inside the newly created directory by using `cd personnel`
3. Install server dependencies by using `npm install` (will install the packages in package.json)
4. Install [bower](http://bower.io) package manager globally by using `sudo npm install -g bower` (it may prompt you to re-enter your password)
5. Install client dependencies by using `bower install` (will install the packages in bower.json)
6. Install [gulp](http://gulpjs.com/) build system by using `sudo npm install -g gulp`

## Configuration
1. Open `app/scripts/config.dev.js` and modify `apiHost` to point to your `personnel-api` instance

## Running Locally
You can now browse to the `app/` directory in the browser to view the development version of the app, which will load more slowly since it loads every file separately. To build the app into a single, production file, use `gulp` and browse to the `app/build/` directory in the browser.

## Source Control
To push changes back to the repository, navigate to the root directory of the app and use `git add .` to find all changes in the directory, then `git commit -m "Summary of the changes"` to group the changes into one commit, then `git push origin master` to push the changes to the GitHub repository.

## Production Deployment
After committing changes to the repository, pull them into the production environment via `git pull origin master`, then build the app via `gulp`.