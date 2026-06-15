const fs = require('fs');
const p = 'C:/Users/USER/.openclaw-autoclaw/workspace/granthunter/frontend/src/pages/AboutPage.tsx';
let t = fs.readFileSync(p, 'utf8');

// Remove definitive unsupported claim
t = t.replace(
  '실제 BizGrant 사용 기업의 지원사업 선정률은 23%로, 국내 평균 7%의 3배 이상입니다.',
  'BizGrant는 적합도 높은 공고를 놓치지 않게 하고, 체계적인 준비로 선정 가능성을 높여드립니다.'
);

// Soften benefit 6 stats
t = t.replace(
  "BizGrant 사용 기업은 평균적으로 연 3~4건의 지원사업에 선정되며, 기업당 평균 1.2억원의 지원금을 확보하고 있습니다. 지원사업 수혜율이 비사용 기업 대비 3.5배 높습니다.",
  "AI 매칭과 체계적인 파이프라인 관리로 더 많은 지원 기회를 발견하고, 효율적으로 준비할 수 있습니다."
);

// Soften ROI numbers
t = t.replace(/연간 1\.2억원/g, "연 최대 수억원");
t = t.replace(/'1\.2억원\/년'/g, "'수억원/년'");
t = t.replace("'120배'", "'100배 이상'");
t = t.replace("120배의 ROI", "100배 이상의 ROI");
t = t.replace(/월 29만원으로 연 1\.2억원의 지원금을/g, "월 29만원으로 연 최대 수억원의 지원금을");
t = t.replace(/평균 사용 기업은 연간 1\.2억원의 지원금을 확보하며/g, "사용 기업은 수억원의 지원금을 확보할 수 있으며");
t = t.replace(/120배의 ROI를/g, "100배 이상의 ROI를");

fs.writeFileSync(p, t, 'utf8');
console.log('Fixed');
