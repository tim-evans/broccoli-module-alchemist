var expect = require('chai').expect;
var alchemist = require('../index.js');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf').sync;
var spawnSync = require('child_process').spawnSync;
var loadGlobal = require('./helpers/load-global');

var emberCLIPath = path.resolve(__dirname, '../node_modules/ember-cli/bin/ember');

describe('JavaScript projects', function() {
  this.timeout(20000);

  var fixturePath = path.resolve(__dirname, './fixtures/simple-app');
  var distPath = path.join(fixturePath, 'dist');

  function fixture(subPath) {
    return path.join(fixturePath, subPath);
  }

  function dist(subPath) {
    return fixture(path.join('dist', subPath));
  }

  before(function() {
    buildPackage(fixturePath);
  });

  after(function() {
    cleanup(fixturePath);
  });

  it('produces an ES6 build', function() {
    exists(dist('js'));
    exists(dist('js/index.js'));

    contains(dist('js/index.js'), "export default function ()");
    contains(dist('js/foo.js'), "return 'foo';");
    contains(dist( 'js/bar.js'), "return 'bar';");
    contains(dist( 'js/index.js'), "return 'default';");
  });

  it('produces a UMD build', function() {
    exists(dist('umd'));

    var umdPath = dist('umd/simple-app.js');

    exists(umdPath);

    var global = loadGlobal(umdPath);

    expect(global.SimpleApp.default()).to.equal('default');
    expect(global.SimpleApp.foo()).to.equal('foo');
    expect(global.SimpleApp.bar()).to.equal('bar');
  });

  it('allows specifying a custom UMD global name', function() {
    var customGlobalPath = path.resolve(__dirname, './fixtures/custom-global-name');

    try {
      buildPackage(customGlobalPath);

      var global = loadGlobal(path.join(customGlobalPath, 'dist/umd/simple-app.js'));

      expect(global.ComplexApp.default()).to.equal('default');
      expect(global.ComplexApp.foo()).to.equal('foo');
      expect(global.ComplexApp.bar()).to.equal('bar');

    } finally {
      cleanup(customGlobalPath);
    }

  });

  it('produces a CommonJS build', function() {
    exists(dist('cjs'));

    var simpleApp = require(dist('cjs'));

    expect(simpleApp.default()).to.equal('default');
    expect(simpleApp.foo()).to.equal('foo');
    expect(simpleApp.bar()).to.equal('bar');
  });
});

function buildPackage(packagePath) {
  var build = spawnSync(emberCLIPath, ['build'], {
    cwd: packagePath
  });

  if (build.status !== 0) {
    throw new Error(build.stderr.toString());
  }
}

function cleanup(packagePath) {
  rimraf(path.join(packagePath, 'dist'));
  rimraf(path.join(packagePath, 'tmp'));
}

function exists(path) {
  expect(fs.existsSync(path), path + ' exists').to.be.true;
}

function contains(path, content) {
  expect(fs.readFileSync(path).toString().indexOf(content) > -1, path + ' contains ' + content).to.be.true;
}
