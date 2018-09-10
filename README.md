# videojs-generator-verify

[![Build Status](https://travis-ci.org/brightcove/videojs-generator-verify.svg?branch=master)](https://travis-ci.org/brightcove/videojs-generator-verify)
[![Greenkeeper badge](https://badges.greenkeeper.io/brightcove/videojs-generator-verify.svg)](https://greenkeeper.io/)
[![Slack Status](http://slack.videojs.com/badge.svg)](http://slack.videojs.com)

[![NPM](https://nodei.co/npm/videojs-generator-verify.png?downloads=true&downloadRank=true)](https://nodei.co/npm/videojs-generator-verify/)

A tool to verify that a videojs-generate-plugin project is ready for publish.

Maintenance Status: Stable

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Inclusion](#inclusion)
- [Basic Usage](#basic-usage)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Install `videojs-generator-verify` and `in-publish` via npm

```sh
$ npm install --save-dev videojs-generator-verify in-publish
```

Then add a script to your `package.json` as follows:

```json
{
  "scripts": {
    "prepublish": "not-in-install && npm run build && vjsverify || in-install"
  }
}
```

## Usage

### Command line
This package provides three binaries, most are just an alias for `videojs-generator-verify`:
`vjsverify`, `videojs-verify`, and `videojs-generator-verify`

```sh

  Usage: vjsverify [--verbose]

  A tool to verify that a videojs-generate-plugin project is ready for publish.

  -v, --version       Print the version of videojs-generator-verify.
  -V, --verbose       Print all results, even successful ones.
  -q, --quiet         Don't print anything.
  -d, --dir [dir]     Run in this project directory, defaults to cwd.
```

### API
It is also possible to require this package, and run the `verify` function manually.
It takes three options `verbose` and `quiet` which are `booleans` and `dir` which is the directory to
verify. It then returns a promise with the exit code, `0` on success and `1` on failure.

## What is tested
This package tests three things:

1. Do all the files referenced in `package.json` point to a file that exists
2. Will the package be installable from npm after publish
3. Are the dist files all using es5 syntax

## License

Apache-2.0. Copyright (c) Brightcove, Inc.
