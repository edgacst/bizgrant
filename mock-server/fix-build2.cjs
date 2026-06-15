const fs = require('fs');

// Fix StatsCounter - just remove unused import correctly
const p1 = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/components/StatsCounter.tsx';
let t1 = fs.readFileSync(p1, 'utf8');
// Undo previous bad fix
t1 = t1.replace('any', 'LucideIcon');
t1 = "import { LucideIcon } from 'lucide-react';\n" + t1;
// Change import type usage to avoid TS6133
t1 = t1.replace("import { LucideIcon } from 'lucide-react';\nimport { LucideIcon } from 'lucide-react';\n", "import type { LucideIcon } from 'lucide-react';\n");
fs.writeFileSync(p1, t1, 'utf8');

// Fix App.tsx - remove unused useLocation
const p2 = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/App.tsx';
let t2 = fs.readFileSync(p2, 'utf8');
t2 = t2.replace(', useLocation', '');
fs.writeFileSync(p2, t2, 'utf8');

// Fix GrantComparison unused imports
const p3 = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/components/GrantComparison.tsx';
let t3 = fs.readFileSync(p3, 'utf8');
t3 = t3.replace(/import \{.*?\} from 'lucide-react';/, "// imports removed (unused)");
fs.writeFileSync(p3, t3, 'utf8');

console.log('Fixed');
