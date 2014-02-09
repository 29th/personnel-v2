Personnel System
================
To setup locally:

First, make sure you have [node.js](http://nodejs.org/) installed.

1. Clone the repository by using `git clonegit@github.com:29th/personnel.git`
2. Install server dependencies by using `npm install` (will install the packages in package.json)
3. Install [bower](http://bower.io) package manager globally by using `npm install -g bower`
4. Install client dependencies by using `bower install` (will install the packages in bower.json)

You can now browse to the `app/` directory in the browser to view the development version of the app, which will load more slowly since it loads every file separately. To build the app into a single, production file, use `gulp` and browse to the `app/build/` directory in the browser.

Note that the API calls to `api.29th.org` will fail unless they come from origins pre-configured in the API server config (currently personnel.29th.org, 29th.github.io)