#!/bin/bash

# Get updates
git reset --hard HEAD
git pull origin master
git status -sb

# Get dependencies
composer install