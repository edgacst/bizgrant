const fs = require('fs');
const path = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/PipelinePage.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Replace corrupted demo items with clean English data
const cleanDemoItems = {
  items1: [
    "  const [items, setItems] = useState<PipelineItem[]>([",
    "    {",
    "      id: 1, grantId: 101, title: 'SME R&D Innovation Support',",
    "      organization: 'Seoul Economic Agency', category: 'R&D', budget: '50M KRW',",
    "      stage: 'submitted', dueDate: '2026-07-31', notes: 'Submitted via online portal',",
    "      documents: ['RFP_merged_final.pdf'], daysLeft: 52,",
    "    },",
    "    {",
    "      id: 2, grantId: 102, title: 'Smart Factory Subsidy',",
    "      organization: 'Ministry of SMEs', category: 'Manufacturing', budget: '100M KRW',",
    "      stage: 'reviewing', dueDate: '2026-06-20', notes: 'Evaluating requirements',",
    "      documents: [], daysLeft: 12,",
    "    },",
    "    {",
    "      id: 3, grantId: 103, title: 'Startup Ecosystem Support',",
    "      organization: 'Startup Promotion Agency', category: 'Startup', budget: '30M KRW',",
    "      stage: 'preparing', dueDate: '2026-08-31', notes: '',",
    "      documents: [], daysLeft: 83,",
    "    },",
    "    {",
    "      id: 4, grantId: 104, title: 'Export Marketing Grant',",
    "      organization: 'KOTRA', category: 'Export', budget: '20M KRW',",
    "      stage: 'waiting', dueDate: '2026-05-31', notes: 'Waiting for results',",
    "      documents: [], daysLeft: -9,",
    "    },",
    "    {",
    "      id: 5, grantId: 105, title: 'ICT Convergence Support',",
    "      organization: 'NIPA', category: 'IT', budget: '200M KRW',",
    "      stage: 'selected', dueDate: '2026-09-15', notes: 'Selected! Budget confirmed',",
    "      documents: ['contract_signed.pdf'], daysLeft: 98,",
    "    },",
    "    {",
    "      id: 6, grantId: 106, title: 'Global Branding Support',",
    "      organization: 'KOTRA', category: 'Marketing', budget: '50M KRW',",
    "      stage: 'submitted', dueDate: '2026-06-15', notes: '',",
    "      documents: ['application_2026.docx'], daysLeft: 7,",
    "    },",
    "    {",
    "      id: 7, grantId: 107, title: 'HR Training Subsidy',",
    "      organization: 'HRD Korea', category: 'HR', budget: '10M KRW',",
    "      stage: 'rejected', dueDate: '2026-05-31', notes: 'Overlap with existing support',",
    "      documents: [], daysLeft: -9,",
    "    },",
    "    {",
    "      id: 8, grantId: 108, title: 'AI Solution Development',",
    "      organization: 'Information Agency', category: 'R&D', budget: '500M KRW',",
    "      stage: 'preparing', dueDate: '2026-08-15', notes: '',",
    "      documents: [], daysLeft: 67,",
    "    },",
    "  ]);",
  ],
  items2: [
    "  const [items, setItems] = useState<PipelineItem[]>([",
    "    {",
    "      id: 1, grantId: 101, title: 'SME R&D Innovation Support',",
  ],
};

// Find and fix the first demo block
function fixDemoBlock(lines, startPattern, endPattern, cleanLines) {
  let start = -1, end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (start === -1 && lines[i].includes(startPattern)) start = i;
    if (start >= 0 && lines[i].includes(endPattern)) { end = i; break; }
  }
  if (start >= 0 && end > start) {
    return [...lines.slice(0, start), ...cleanLines, ...lines.slice(end + 1)];
  }
  return lines;
}

// Just replace the entire corrupted section using Node's find/replace
// Strategy: find the section from "const [items" to the matching "];" and replace it entirely

let inDemoItems = false;
let demoStart = -1;
let bracketDepth = 0;
let foundFirstDemo = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("const [items, setItems] = useState<PipelineItem[]>(")) {
    if (!foundFirstDemo) {
      foundFirstDemo = true;
      // Replace this demo block and all following lines until '// Demo data end' or similar
      // Find where this block ends
      let j = i;
      let depth = 0;
      for (; j < lines.length; j++) {
        if (lines[j].includes(']');') { // closing of the array with useState
          depth--;
          if (depth === 0) break;
        }
        if (lines[j].includes('[{')); depth++; // array start
        if (lines[j].includes(']);') && depth <= 1) break; // useState closing
      }
      // Replace from i to j with clean data
      const before = lines.slice(0, i);
      const after = lines.slice(j + 1);
      lines = [...before, ...cleanDemoItems.items1, ...after];
      break;
    }
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Written', lines.length, 'lines');
