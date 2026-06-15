const fs = require('fs');
const path = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/PipelinePage.tsx';
let text = fs.readFileSync(path, 'utf8');

// Fix all corrupted Korean in demo data
const fixes = [
  [/toast\.success\('[^']*'\)/g, 'toast.success("Saved!")'],
  [/title: '2026\?\?[^']*'/g, "title: 'Demo Grant'"],
  [/organization: '[^']*KOTRA[^']*'/g, "organization: 'KOTRA'"],
  [/organization: '[^']*\?[^']{5,}[^']*'/g, "organization: 'Demo Agency'"],
  [/category: '[^']*\?[^']*'/g, "category: 'R&D'"],
  [/budget: '\?\?\d+[^']*'/g, "budget: '100M KRW'"],
  [/budget: '\d+\?\?\?\?[^']*'/g, "budget: '100M KRW'"],
  [/budget: '[^']*\?\?\?\?[^']*'/g, "budget: '100M KRW'"],
  [/notes: '[^']*\?[^']{3,}[^']*'/g, "notes: ''"],
  [/documents: \['[^']*\?[^']*'\]/g, "documents: []"],
];

for (const [pattern, replacement] of fixes) {
  text = text.replace(pattern, replacement);
}

fs.writeFileSync(path, text, 'utf8');
console.log('Fixes applied');
