const fs = require('fs');
const path = require('path');

const targetDirs = [
  'frontend/app/(admin)',
  'frontend/app/(auth)',
  'frontend/app/(export-manager)',
  'frontend/app/(finance)',
  'frontend/app/(guest)',
  'frontend/app/(owner)',
  'frontend/app/invite',
  'frontend/app/profile',
  'frontend/app/projects',
  'frontend/app/unauthorized',
];

const replacements = [
  { from: /from-\[\#0a9b5c\]/gi, to: 'from-[#2F6B4F]' },
  { from: /to-\[\#08824d\]/gi, to: 'to-[#25563F]' },
  { from: /hover:from-\[\#08824d\]/gi, to: 'hover:from-[#25563F]' },
  { from: /hover:to-\[\#06683e\]/gi, to: 'hover:to-[#25563F]' },
  { from: /from-\[\#eafaf6\]\/90/gi, to: 'from-[#FAF8F3]/90' },
  { from: /to-\[\#e3f4f9\]\/90/gi, to: 'to-[#F5F8F6]/90' },
  { from: /from-\[\#eef5f3\]/gi, to: 'from-[#F5F8F6]' },
  { from: /bg-\[\#eef3f7\]/gi, to: 'bg-[#F5F8F6]' },
  { from: /bg-\[\#f8fcfb\]/gi, to: 'bg-[#FAF8F3]' },
  { from: /bg-\[\#0a9b5c\]/gi, to: 'bg-[#2F6B4F]' },
  { from: /bg-\[\#0a8c4f\]/gi, to: 'bg-[#2F6B4F]' },
  { from: /text-\[\#0a8c4f\]/gi, to: 'text-[#2F6B4F]' }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

let modifiedCount = 0;

targetDirs.forEach((target) => {
  const absPath = path.join(__dirname, '..', target);
  if (fs.existsSync(absPath)) {
    const files = walkDir(absPath);
    files.forEach((filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      replacements.forEach(rule => {
        content = content.replace(rule.from, rule.to);
      });

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
        modifiedCount++;
      }
    });
  } else {
    console.log(`Directory not found: ${absPath}`);
  }
});

console.log(`\nFinished! Modified ${modifiedCount} files.`);
