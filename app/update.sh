#!/bin/bash

# Get updates
git reset --hard HEAD
git pull origin master
git status

# Get dependencies
npm install

# Build
./node_modules/gulp/bin/gulp.js