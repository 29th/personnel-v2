#!/bin/bash

# Get updates
git reset --hard HEAD
git pull origin master
git status

# Get dependencies
npm install
./node_modules/bower/bin/bower install --allow-root

# Build
./node_modules/gulp/bin/gulp.js