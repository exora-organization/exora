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
  // Primary Green -> Forest Green
  { from: /#386641/gi, to: '#2F6B4F' },
  // Hover Green -> Forest Green Dark
  { from: /#2A4D31/gi, to: '#25563F' },
  
  // Backgrounds
  { from: /#F9F8F3/gi, to: '#FAF8F3' }, // Main Background
  { from: /#F2E8CF/gi, to: '#F5F8F6' }, // Alternate Sections
  
  // Headings & Text
  { from: /#2B3A32/gi, to: '#1F2937' },
  { from: /#526259/gi, to: '#4B5563' },
  { from: /#747C78/gi, to: '#9CA3AF' },
  
  // Borders
  { from: /#E3D8C3/gi, to: '#E8E3D9' },
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
