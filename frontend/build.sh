#!/bin/bash

# Install dependencies
npm install

# Build the project
npm run build

# Move the build files to the specified directory
cp -r build/* /opt/render/project/src/dist/
