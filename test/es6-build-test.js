var expect = require('chai').expect;
var alchemist = require('../index.js');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf').sync;
var spawnSync = require('child_process').spawnSync;

var emberCLIPath = path.resolve(__dirname, '../node_modules/ember-cli/bin/ember');

describe('JavaScript projects', function() {
  this.timeout(20000);

  var fixture = path.resolve(__dirname, './fixtures/simple-app');

  beforeEach(function() {
    var build = spawnSync(emberCLIPath, ['build'], {
      cwd: fixture
    });

    if (build.status !== 0) {
      throw new Error(build.stderr.toString());
    }
  });

  afterEach(function() {
    rimraf(path.join(fixture, 'dist'));
    rimraf(path.join(fixture, 'tmp'));
  });

  it('produces an ES6 build', function() {
    var distDir = path.join(fixture, 'dist');

    exists(path.join(distDir, 'es6'));
    exists(path.join(distDir, 'es6/index.js'));

    contains(path.join(distDir, 'es6/index.js'), "export default function()");
    contains(path.join(distDir, 'es6/foo.js'), "console.log('foo');");
    contains(path.join(distDir, 'es6/bar.js'), "console.log('bar');");
    contains(path.join(distDir, 'es6/index.js'), "console.log('default function export');");
  });

  it('produces a UMD build', function() {
    var distDir = path.join(fixture, 'dist');

    exists(path.join(distDir, 'umd'));
    exists(path.join(distDir, 'umd/simple-app.js'));

    contains(path.join(distDir, 'umd/simple-app.js'), "SimpleApp");
    contains(path.join(distDir, 'umd/simple-app.js'), "console.log('foo');");
    contains(path.join(distDir, 'umd/simple-app.js'), "console.log('bar');");
    contains(path.join(distDir, 'umd/simple-app.js'), "console.log('default function export');");
  });
});

function exists(path) {
  expect(fs.existsSync(path), path + ' exists').to.be.true;
}

function contains(path, content) {
  expect(fs.readFileSync(path).toString().indexOf(content) > -1, path + ' contains ' + content).to.be.true;
}
