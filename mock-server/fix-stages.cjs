const fs = require('fs');
const p = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/PipelinePage.tsx';
let t = fs.readFileSync(p, 'utf8');

const map = {
  "'discovered'": "'DISCOVERED'",
  "'reviewing'": "'REVIEWING'",
  "'preparing'": "'PREPARING'",
  "'submitted'": "'SUBMITTED'",
  "'waiting'": "'WAITING'",
  "'selected'": "'SELECTED'",
  "'rejected'": "'REJECTED'",
};

for (const [k, v] of Object.entries(map)) {
  t = t.replace(new RegExp(k, 'g'), v);
}

fs.writeFileSync(p, t, 'utf8');
console.log('Fixed stages to UPPERCASE');
