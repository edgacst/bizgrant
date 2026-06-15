import type { GrantNotice } from '../types';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function exportGrantPdf(grant: GrantNotice) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${grant.title}</title>
  <style>
    body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; color: #111; margin: 32px; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .meta { color: #555; font-size: 14px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #eef2ff; color: #4338ca; padding: 4px 10px; border-radius: 999px; font-size: 12px; margin-right: 8px; }
    section { margin-bottom: 24px; }
    h2 { font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 10px; }
    p, pre { white-space: pre-wrap; font-size: 14px; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="badge">${grant.category || '기타'}</div>
  <h1>${grant.title}</h1>
  <div class="meta">
    <div>주관기관: ${grant.organization || '-'}</div>
    <div>신청기간: ${formatDate(grant.applyStart)} ~ ${formatDate(grant.applyEnd)}</div>
    <div>지원금액: ${grant.budget || '-'}</div>
    ${grant.originalUrl ? `<div>원문: ${grant.originalUrl}</div>` : ''}
  </div>
  <section>
    <h2>사업 개요</h2>
    <pre>${grant.content || '-'}</pre>
  </section>
  <section>
    <h2>지원 자격</h2>
    <pre>${grant.eligibility || '-'}</pre>
  </section>
  <section>
    <h2>필요 서류</h2>
    <pre>${grant.requirements || '-'}</pre>
  </section>
  <div class="footer">BizGrant | ${new Date().toLocaleString('ko-KR')}</div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!printWindow) {
    throw new Error('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
