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
  // Colors
  { from: /#0a8c4f/gi, to: '#10B981' },
  { from: /#0a9b5c/gi, to: '#10B981' }, // Navbar primary
  { from: /#08824d/gi, to: '#059669' },
  { from: /#06683e/gi, to: '#059669' },
  { from: /#022f35/gi, to: '#0F172A' },
  { from: /#eafaf6/gi, to: '#ECFDF5' },
  { from: /#f8fcfb/gi, to: '#F6FFFB' },
  { from: /#f2fbf7/gi, to: '#F6FFFB' },
  
  // Tailwind Classes
  { from: /bg-gray-50/g, to: 'bg-[#F6FFFB]' },
  { from: /border-gray-100/g, to: 'border-[#E5E7EB]' },
  { from: /border-gray-200/g, to: 'border-[#E5E7EB]' },
  
  // Text Colors
  { from: /text-gray-900/g, to: 'text-[#0F172A]' },
  { from: /text-gray-700/g, to: 'text-[#475569]' },
  { from: /text-gray-600/g, to: 'text-[#475569]' },
  { from: /text-gray-500/g, to: 'text-[#64748B]' }
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
