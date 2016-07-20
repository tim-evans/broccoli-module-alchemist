var fs = require('fs');
var TypeScriptCompiler = require('broccoli-typescript-compiler');
var findupSync = require('findup-sync');
var path = require('path');
var stew = require('broccoli-stew');
var mergeTrees = require('broccoli-merge-trees');
var rollup = require('broccoli-rollup');
var assert = require('assert');

function typeScript(node, options) {
  var tree = new TypeScriptCompiler(node, options);
  tree.extensions.push('js');

  return tree;
}

function findProjectPath() {
  var buildPath = findupSync('ember-cli-build.js', process.cwd());
  if (!buildPath) {
    buildPath = findupSync('Brocfile.js');
  }

  return  path.dirname(buildPath);
}

module.exports = function(options) {
  options = options || {};

  var projectPath = findProjectPath();
  var projectName = getPackageName(projectPath);
  var srcPath = path.join(projectPath, 'src');

  var targets = options.targets || ['js', 'cjs', 'umd'];

  assert.ok(targets instanceof Array, 'targets option must be an array of target formats');
  normalizeTargets(targets);

  var outputTrees = [];

  function hasTarget(target) {
    return targets.indexOf(target) > -1;
  }

  // First, transpile the source TypeScript/ES2015+ JavaScript into ES5.
  // We'll create two versions:
  //
  // * A version with ES2015 module syntax, for the browser.
  //   (All other browser-targeted builds are derived from this using
  //   Rollup).
  // * A version with CommonJS modules, for Node.js.

  // Create a Broccoli tree for all input JavaScript and TypeScript files.
  var src = stew.find(srcPath, {
    include: [
      '**/*.js',
      '**/*.ts'
    ]
  });

  var js = typeScript(src, {
    tsconfig: {
      compilerOptions: {
        target: 'es5',
        module: 'es2015',
        sourceMaps: 'inline'
      }
    }
  });

  if (hasTarget('js')) {
    outputTrees.push(stew.mv(js, 'js'));
  }

  if (hasTarget('cjs')) {
    var cjs = typeScript(src, {
      tsconfig: {
        compilerOptions: {
          target: 'es5',
          module: 'commonjs',
          sourceMap: true,
          inlineSourceMap: true
        }
      }
    });

    cjs = stew.mv(cjs, 'cjs');

    outputTrees.push(cjs);
  }

  if (hasTarget('umd')) {
    var umd = rollup(js, {
      inputFiles: ['**/*.js'],
      rollup: {
        format: 'umd',
        moduleName: options.moduleName || camelize(projectName),
        entry: options.entry || 'index.js',
        dest: projectName + '.js'
      }
    });

    umd = stew.mv(umd, 'umd');

    outputTrees.push(umd);
  }

  return mergeTrees(outputTrees);
};

function normalizeTargets(targets) {
  for (var i = 0; i < targets.length; i++) {
    switch (targets[i]) {
      case 'es6':
      case 'es2015':
        targets[i] = 'js';
        break;
      case 'commonjs':
        targets[i] = 'cjs';
        break;
    }
  }
}

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
