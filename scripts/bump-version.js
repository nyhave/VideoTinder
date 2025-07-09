const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const parts = pkg.version.split('.').map(n => parseInt(n, 10) || 0);
if (parts.length < 3) {
  while (parts.length < 3) parts.push(0);
}
parts[2] += 1; // bump patch version
pkg.version = parts.join('.');

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const versionFile = path.join(__dirname, '..', 'src', 'version.js');
fs.writeFileSync(versionFile, `export default '${pkg.version}';\n`);
console.log('Version bumped to', pkg.version);
