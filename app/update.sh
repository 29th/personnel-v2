#!/bin/bash

# Get updates
git reset --hard HEAD
git pull origin master
git status

# Get dependencies
npm install

# Build
npm run build