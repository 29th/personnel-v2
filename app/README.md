# Personnel System

## Installation

First, make sure you have [node.js](http://nodejs.org/) installed.

1. Clone the repository by using `git clone git@github.com:29th/personnel.git`
2. Navigate inside the newly created directory by using `cd personnel`
3. Install server dependencies by using `npm install` (will install the packages in package.json)
4. Install [bower](http://bower.io) package manager globally by using `sudo npm install -g bower` (it may prompt you to re-enter your password)
5. Install client dependencies by using `bower install` (will install the packages in bower.json)

## Running Locally
You can now browse to the `app/` directory in the browser to view the development version of the app, which will load more slowly since it loads every file separately. To build the app into a single, production file, use `gulp` and browse to the `app/build/` directory in the browser.

Note that the API calls to `api.29th.org` will fail unless they come from origins pre-configured in the API server config (currently personnel.29th.org, 29th.github.io)

## Source Control
To push changes back to the repository, navigate to the root directory of the app and use `git add .` to find all changes in the directory, then `git commit -m "Summary of the changes"` to group the changes into one commit, then `git push origin master` to push the changes to the GitHub repository.

## Production Deployment
The build process puts files in the `app/build/` directory, which is ignored by the git repository. To push the built app to production, we'll create another git repository inside the `app/build/` directory using the `gh-pages` branch. To do this:

1. Delete the `app/build/` directory
2. Navigate to `app/`
3. Use `git clone -b gh-pages -o production git@github.com:29th/personnel.git build` to clone the `gh-pages` branch of the repository into the `app/build/` directory and name the remote "production"

Once you've done that, you can run the build process described above, then navigate inside `app/build/` and use `git add .`, `git commit -m "Summary of changes"`, and `git push production gh-pages` to deploy. Be sure to specify `gh-pages` in the final command or you will experience merge issues.