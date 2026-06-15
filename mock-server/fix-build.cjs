const fs = require('fs');

// Fix StatsCounter
const p1 = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/components/StatsCounter.tsx';
let t1 = fs.readFileSync(p1, 'utf8');
t1 = t1.replace("import { LucideIcon } from 'lucide-react';\n", '');
t1 = t1.replace(/LucideIcon/g, 'any');
fs.writeFileSync(p1, t1, 'utf8');

// Fix CalendarPage
const p2 = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/CalendarPage.tsx';
let t2 = fs.readFileSync(p2, 'utf8');
t2 = t2.replace(',\n  Tag', '');
fs.writeFileSync(p2, t2, 'utf8');

console.log('All fixed');
