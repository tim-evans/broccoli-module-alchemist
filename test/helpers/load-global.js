var vm = require('vm');
var fs = require('fs');

module.exports = function(filePath, sandbox) {
  var code = fs.readFileSync(filePath);

  sandbox = sandbox || {};
  vm.runInNewContext(code, sandbox);

  return sandbox;
};
