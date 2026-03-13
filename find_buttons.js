const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function checkFile(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  // simple regex to find all <button ... > tags
  const regex = /<button([^>]*)>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const attrs = match[1];
    if (!attrs.includes("onClick") && !attrs.includes("type=\"submit\"") && !attrs.includes("disabled")) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      console.log(`${filePath}:${lineNum} : <button${attrs}>`);
    }
  }
}

walkDir('/Users/muhammedanshifp/Downloads/b_DSS4s3J9928-1772311986230/components', checkFile);
walkDir('/Users/muhammedanshifp/Downloads/b_DSS4s3J9928-1772311986230/app', checkFile);
