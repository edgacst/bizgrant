const fs = require('fs');
const p = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/backend/src/main/java/com/granthunter/entity/User.java';
let t = fs.readFileSync(p, 'utf8');
t = t.replace(/status = "active"/g, 'status = "ACTIVE"');
fs.writeFileSync(p, t, 'utf8');
console.log('Fixed');
