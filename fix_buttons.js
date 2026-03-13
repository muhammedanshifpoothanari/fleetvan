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
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Regex to match <button ... > tags.
    // It captures the attributes part. 
    // We will selectively replace those that don't have onClick or type="submit".
    const regex = /<button(\s[^>]*)?>/g;

    content = content.replace(regex, (match, p1) => {
        const attrs = p1 || "";
        if (!attrs.includes("onClick") && !attrs.includes("type=\"submit\"") && !attrs.includes("disabled")) {
            changed = true;
            return `<button onClick={() => alert("Feature coming soon")}${attrs}>`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

walkDir('/Users/muhammedanshifp/Downloads/b_DSS4s3J9928-1772311986230/components', checkFile);
walkDir('/Users/muhammedanshifp/Downloads/b_DSS4s3J9928-1772311986230/app', checkFile);
