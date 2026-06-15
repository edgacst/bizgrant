const fs = require('fs');
const f = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/LandingPage.tsx';
let t = fs.readFileSync(f, 'utf8');
t = t.replace(',\n  ChevronRight', '');
t = t.replace("const [yearly] = useState(false);", "const [_yearly] = useState(false);");
fs.writeFileSync(f, t, 'utf8');
console.log('Fixed');
