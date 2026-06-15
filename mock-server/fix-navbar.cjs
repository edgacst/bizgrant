const fs = require('fs');
const p = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/components/Navbar.tsx';
let t = fs.readFileSync(p, 'utf8');
t = t.replace(/Grant<span className="gradient-text">Hunter<\/span>/g, 'Biz<span className="gradient-text">Grant</span>');
fs.writeFileSync(p, t, 'utf8');
console.log('Fixed Navbar branding');
