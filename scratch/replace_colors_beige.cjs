const fs = require('fs');
const path = require('path');

const files = [
  'frontend/app/page.tsx',
  'frontend/app/about/page.tsx',
  'frontend/app/services/page.tsx',
  'frontend/app/blog/page.tsx',
  'frontend/app/contact/page.tsx',
  'frontend/components/public/PublicNavbar.tsx',
  'frontend/components/public/PublicFooter.tsx'
];

const replacements = [
  // Primary Green -> Earthy Green
  { from: /#10B981/gi, to: '#386641' },
  // Hover Green -> Darker Earthy Green
  { from: /#059669/gi, to: '#2A4D31' },
  
  // Backgrounds: Mint -> Beige
  { from: /#ECFDF5/gi, to: '#F2E8CF' },
  { from: /#F6FFFB/gi, to: '#F9F8F3' },
  
  // Headings & Text: Navy/Slate -> Deep Olive/Charcoal
  { from: /#0F172A/gi, to: '#2B3A32' },
  { from: /#475569/gi, to: '#526259' },
  { from: /#64748B/gi, to: '#747C78' },
  
  // Borders: Light Gray -> Beige Border
  { from: /#E5E7EB/gi, to: '#E3D8C3' },
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(rule => {
      content = content.replace(rule.from, rule.to);
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
