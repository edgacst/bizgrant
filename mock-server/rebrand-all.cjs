const fs = require('fs');

// Fix SignupPage
let s = fs.readFileSync('C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/SignupPage.tsx', 'utf8');
s = s.replace("Grant<span className=\"gradient-text\">Hunter</span>", "Biz<span className=\"gradient-text\">Grant</span>");
fs.writeFileSync('C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/SignupPage.tsx', s, 'utf8');

// Fix LoginPage
let l = fs.readFileSync('C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/LoginPage.tsx', 'utf8');
l = l.replace("Grant<span className=\"gradient-text\">Hunter</span>", "Biz<span className=\"gradient-text\">Grant</span>");
fs.writeFileSync('C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/LoginPage.tsx', l, 'utf8');

// Also fix any remaining GrantHunter references in other pages
const pages = [
  'DashboardPage', 'GrantListPage', 'GrantDetailPage', 'AlertConfigPage',
  'PricingPage', 'CalendarPage', 'PipelinePage', 'TermsPage', 'PrivacyPage'
];
for (const page of pages) {
  const fp = `C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/${page}.tsx`;
  try {
    let t = fs.readFileSync(fp, 'utf8');
    const before = t.length;
    t = t.replace(/GrantHunter/g, 'BizGrant');
    t = t.replace(/grant-hunter/gi, 'bizgrant');
    t = t.replace(/granthunter/gi, 'bizgrant');
    if (t.length !== before) {
      fs.writeFileSync(fp, t, 'utf8');
      console.log('Fixed:', page);
    }
  } catch(e) { /* file doesn't exist */ }
}

// Fix components
const components = ['ProtectedRoute', 'BackToTop', 'PricingCard', 'StatsCounter', 'GrantComparison', 'DarkModeToggle'];
for (const comp of components) {
  const fp = `C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/components/${comp}.tsx`;
  try {
    let t = fs.readFileSync(fp, 'utf8');
    const before = t.length;
    t = t.replace(/GrantHunter/g, 'BizGrant');
    if (t.length !== before) {
      fs.writeFileSync(fp, t, 'utf8');
      console.log('Fixed:', comp);
    }
  } catch(e) {}
}

console.log('Done');
