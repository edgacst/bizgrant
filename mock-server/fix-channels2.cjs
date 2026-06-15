const fs = require('fs');
const p = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/AlertConfigPage.tsx';
let t = fs.readFileSync(p, 'utf8');

// Fix demo history channels
t = t.replace("channel: 'Telegram',", "channel: '카카오톡',");
t = t.replace("channel: 'Slack',", "channel: '이메일',");
t = t.replace("channel: 'Email',", "channel: '문자',");

// Fix channelId field visibility condition
t = t.replace(
  "{(form.channel === 'telegram' || form.channel === 'slack') && (",
  "{form.channel === 'kakao' && ("
);

// Fix channelId label
t = t.replace(
  "{form.channel === 'telegram' ? 'Telegram Chat ID' : 'Slack Webhook URL'}",
  "{'카카오톡 채널 ID'}"
);

// Fix helper text
t = t.replace(
  "{form.channel === 'telegram'\n                ? '개인 또는 그룹의 Telegram Chat ID를 입력하세요'\n                : 'Slack Incoming Webhook URL을 입력하세요'}",
  "{'카카오톡 알림톡 채널 ID를 입력하세요'}"
);

fs.writeFileSync(p, t, 'utf8');
console.log('Fixed');
