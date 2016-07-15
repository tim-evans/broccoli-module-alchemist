# Broccoli Module Alchemist
[![Build Status](https://travis-ci.org/monegraph/broccoli-module-alchemist.svg?branch=master)](https://travis-ci.org/monegraph/broccoli-module-alchemist)

A Broccoli plugin for transpiling TypeScript and JavaScript code written with standard module syntax ("ES6 modules") into legacy module formats, like UMD, AMD and CommonJS.

## Usage

Broccoli Module Alchemist is a Broccoli plugin that can be used from your project's `ember-cli-build.js` or `Brocfile.js`.

Here's an example `ember-cli-build.js` file:

```js
var alchemist = require('broccoli-module-alchemist');

module.exports = function() {
  return alchemist();
}
```

## Authoring JavaScript and TypeScript

Place your package's source code in a root `src` directory. TypeScript files should have the extension `.ts`, while JavaScript files should have the extension `.js`.

Make sure to use the [standard module syntax](http://www.2ality.com/2014/09/es6-modules-final.html) for importing dependencies and specifying exports.

## Output

When your package is built (either by running `ember build` or `broccoli build`), the transpiled output will be placed into the `dist` directory.

In all cases, the source JavaScript or TypeScript is compiled to an ES5 target for maximum compatibility across
browsers and Node.js versions. For example, the JavaScript module output contains ES6 module syntax but all other code
is converted to ES5.

| Path                     | Format                                                     |
|--------------------------|------------------------------------------------------------|
| dist/js                  | JavaScript (ES6) modules, ES5 code                         |
| dist/cjs                 | CommonJS                                                   |
| dist/umd/package-name.js | UMD (AMD if detected, global in browser, CommonJS in Node) |

## Distribution

### npm

In your `package.json`:

1. Add a `main` entry pointing to `dist/cjs/index.js` (or whatever your entry point is).
2. Add a `jsnext:main` entry pointing to `dist/js/index.js`.

### Bower

We do not recommend supporting Bower, but if you would like to for backwards-compatibility, consider creating a new repository on GitHub and publishing a `bower.json` there, along with whatever directories in `dist` you want to support (probably UMD).
