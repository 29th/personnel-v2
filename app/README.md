# Personnel System

## Installation

First, make sure you have [node.js](http://nodejs.org/) with npm installed.

1. Clone the repository by using `git clone git@github.com:29th/personnel-app.git`
2. Navigate inside the newly created directory by using `cd personnel-app`
3. Install dependencies by using `npm install` (will install the packages in package.json)

## Configuration
Copy `.env.sample` to `.env` and, if necessary, edit its values to match your environment

## Compile
Run the command `npm run build` inside the directory to compile the application into the `dist/` directory, which you can then view in the browser.

As an alternative to running this command after every change, you can use `npm run watch` to automatically recomplie any time javascript files are changed (a faster recompile too). Use `CTRL + C` to stop watching.

## Source Control
To push changes back to the repository, navigate to the root directory of the app and use `git add .` to find all changes in the directory, then `git commit -m "Summary of the changes"` to group the changes into one commit, then `git push origin master` to push the changes to the GitHub repository.
