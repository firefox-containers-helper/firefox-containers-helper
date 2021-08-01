#!/bin/bash -xe

# to generate docs, first run:
# sudo -EH npm install -g jsdoc jsdoc-to-markdown

jsdoc2md ./src/context.js >./docs/context.md
jsdoc -d ./docs ./src/context.js
