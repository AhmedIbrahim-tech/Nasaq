const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(getAllFiles(full, exts));
    } else if (exts.includes(path.extname(full))) {
      files.push(full);
    }
  }
  return files;
}

const srcDir = path.resolve(__dirname, '../src');
const files = getAllFiles(srcDir);
let broken = 0;
let checked = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const importMatches = [...content.matchAll(/from\s+['"](@\/[^'"]+)['"]/g)];
  for (const match of importMatches) {
    checked++;
    const importPath = match[1].replace('@/', srcDir + '/');
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    const exists = extensions.some(ext => {
      const fullP = path.resolve(importPath + ext);
      return fs.existsSync(fullP) && !fs.statSync(fullP).isDirectory();
    });
    if (!exists) {
      console.log('BROKEN:', match[1], 'in', file);
      broken++;
    }
  }
}

console.log(`Imports checked: ${checked} | Broken: ${broken}`);
process.exit(broken > 0 ? 1 : 0);
