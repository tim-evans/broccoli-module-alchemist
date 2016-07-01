var vm = require('vm');
var fs = require('fs');

module.exports = function(filePath) {
  var code = fs.readFileSync(filePath);

  var sandbox = {};
  vm.runInNewContext(code, sandbox);

  return sandbox;
};
