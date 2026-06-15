const fs = require('fs');
const p = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/AlertConfigPage.tsx';
let t = fs.readFileSync(p, 'utf8');

// Add MessageSquare icon for SMS
t = t.replace(
  "import {\n  Save,\n  Bell,\n  Mail,\n  MessageCircle,\n  ExternalLink,\n  CheckCircle,\n  XCircle,\n  Clock,\n  Sparkles,\n} from 'lucide-react';",
  "import {\n  Save,\n  Bell,\n  Mail,\n  MessageCircle,\n  Smartphone,\n  CheckCircle,\n  XCircle,\n  Clock,\n  Sparkles,\n} from 'lucide-react';"
);

// Change default channel to email
t = t.replace("channel: 'telegram',", "channel: 'email',");
t = t.replace("channel: prefs.channel || 'telegram',", "channel: prefs.channel || 'email',");

// Simplify channel ID validation (email doesn't need channelId)
t = t.replace(
  "if ((form.channel === 'telegram' || form.channel === 'slack') && !form.channelId) {\n      toast.error('알림 채널 ID를 입력해주세요.');\n      return;\n    }",
  "if (form.channel === 'kakao' && !form.channelId) {\n      toast.error('카카오톡 채널 ID를 입력해주세요.');\n      return;\n    }"
);

// Replace channel options: Telegram/Slack/Email → KakaoTalk/Email/SMS
const channelSection = `          <div>
            <label className="block font-semibold text-gray-900 dark:text-white mb-2">
              알림 채널
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'kakao' as const, label: '카카오톡', icon: MessageCircle },
                { value: 'email' as const, label: '이메일', icon: Mail },
                { value: 'sms' as const, label: '문자', icon: Smartphone },
              ].map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.value}
                    onClick={() => setForm((prev) => ({ ...prev, channel: ch.value }))}
                    className={\`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all \${
                      form.channel === ch.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-300'
                    }\`}
                  >
                    <Icon className={\`w-6 h-6 \${form.channel === ch.value ? 'text-brand-600' : ''}\`} />
                    <span className="text-sm font-bold">{ch.label}</span>
                  </button>`;

const oldChannelSection = `          <div>
            <label className="block font-semibold text-gray-900 dark:text-white mb-2">
              알림 채널
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'telegram' as const, label: 'Telegram', icon: MessageCircle },
                { value: 'slack' as const, label: 'Slack', icon: ExternalLink },
                { value: 'email' as const, label: 'Email', icon: Mail },
              ].map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.value}
                    onClick={() => setForm((prev) => ({ ...prev, channel: ch.value }))}
                    className={\`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all \${
                      form.channel === ch.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-300'
                    }\`}
                  >
                    <Icon className={\`w-6 h-6 \${form.channel === ch.value ? 'text-brand-600' : ''}\`} />
                    <span className="text-sm font-bold">{ch.label}</span>
                  </button>`;

t = t.replace(oldChannelSection, channelSection);

// Update channelId input label
t = t.replace(
  /채널 ID.*?(?:Telegram|Slack|이메일)/s,
  "카카오톡 채널 ID (이메일·문자는 자동)"
);
// More targeted: replace the channelId section
t = t.replace(
  /{form\.channel !== 'email' && \(/,
  "{form.channel === 'kakao' && ("
);

fs.writeFileSync(p, t, 'utf8');
console.log('Fixed channels to KakaoTalk/Email/SMS');
