var path = require('path');
var findup = require('findup-sync');

module.exports = function(requirePath) {
  var pkgPath = findup('package.json', { cwd: path.dirname(module.parent.filename) });
  pkgPath = path.dirname(pkgPath);

  try {
    return require(path.join(pkgPath, 'src', requirePath));
  } catch (e) {
    return require(path.join(pkgPath, 'dist/cjs', requirePath));
  }
};
