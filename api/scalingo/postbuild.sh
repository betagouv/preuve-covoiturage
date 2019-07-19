#!/bin/sh

# script runs from the api folder

# clean up ilos node_modules to save space
find ./ilos -type d -name node_modules -exec rm -rf {} +
