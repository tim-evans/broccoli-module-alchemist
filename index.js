var fs = require('fs');
var typeScript = require('broccoli-typescript-compiler');
var findupSync = require('findup-sync');
var path = require('path');
var stew = require('broccoli-stew');
var mergeTrees = require('broccoli-merge-trees');
var rollup = require('broccoli-rollup');

module.exports = function(options) {
  options = options || {};

  var projectPath = path.dirname(findupSync('ember-cli-build.js', process.cwd()));
  var projectName = getPackageName(projectPath);
  var srcPath = path.join(projectPath, 'src');

  var src = stew.find(srcPath, {
    include: [
      '**/*.js',
      '**/*.ts'
    ]
  });

  var compiled = typeScript(src, {
    tsconfig: {
      "compilerOptions": {
        "target": "ES6"
      }
    }
  });

  var es6 = stew.mv(compiled, 'es6');

  var umd = rollup(compiled, {
    inputFiles: ['**/*.js'],
    rollup: {
      format: 'umd',
      moduleName: options.moduleName || camelize(projectName),
      entry: options.entry || 'index.js',
      dest: projectName + '.js'
    }
  });

  umd = stew.mv(umd, 'umd');

  return mergeTrees([es6, umd]);
};

function getPackageName(projectPath) {
  return JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'))).name;
}

var STRING_CAMELIZE_REGEXP_1 = (/(\-|\_|\.|\s)+(.)?/g);
var STRING_CAMELIZE_REGEXP_2 = (/(^|\/)([A-Z])/g);

function camelize(key) {
  key = key.replace(STRING_CAMELIZE_REGEXP_1, function(match, separator, chr) {
    return chr ? chr.toUpperCase() : '';
  }).replace(STRING_CAMELIZE_REGEXP_2, function(match, separator, chr) {
    return match.toLowerCase();
  });

  return key.charAt(0).toUpperCase() + key.substr(1);
}
