const fs = require('fs');
const p = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/AlertConfigPage.tsx';
let t = fs.readFileSync(p, 'utf8');

// Fix API paths
t = t.replace("client.get('/alerts')", "client.get('/prefs')");
t = t.replace("client.get('/alerts/history')", "client.get('/history')");
t = t.replace("client.put('/alerts', form)", "await client.post('/prefs', form).catch(() => client.put('/prefs', form))");

// Fix the false "success" toast on error
t = t.replace(
  "} catch {\n      toast.success('알림 설정이 저장되었습니다.');\n    }",
  "} catch (e) {\n      toast.error('알림 설정 저장에 실패했습니다.');\n    }"
);

fs.writeFileSync(p, t, 'utf8');
console.log('Fixed AlertConfigPage');
