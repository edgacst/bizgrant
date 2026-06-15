const puppeteer = require('puppeteer-core');
const http = require('http');
const API = 'http://localhost:8080/api';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scrape() {
  console.log('🦞 BizGrant Scraper — mss.go.kr\n');
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  let count = 0;
  try {
    const p = await b.newPage();
    await p.setViewport({ width: 1920, height: 1080 });
    
    // 중기부 지원사업 공고
    await p.goto('https://www.mss.go.kr/site/smba/ex/bbs/List.do?cbIdx=81', { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(4000);
    
    const posts = await p.evaluate(() => {
      const r = [], seen = new Set();
      // Only capture links from the board list table, not navigation
      const tableRows = document.querySelectorAll('table.board_list tbody tr, table.bbs_list tbody tr, .board tr, .bbs tr');
      const rows = tableRows.length > 0 ? tableRows : document.querySelectorAll('a[href]');
      
      Array.from(rows).forEach(el => {
        const a = el.tagName === 'A' ? el : el.querySelector('a');
        if (!a) return;
        const h = a.getAttribute('href') || '';
        const t = a.textContent.trim();
        // Filter: only board/view links with meaningful titles
        if (t.length < 10) return;
        if (h.includes('javascript') || h.includes('List.do') || h === '#') return;
        if (h.includes('main.do') || h.includes('login') || h.includes('map')) return;
        if (t === '상단' || t === '하단' || t === '본문' || t === '메뉴') return;
        if (t.includes('기관') && t.length < 15) return;
        if (seen.has(h)) return;
        seen.add(h);
        r.push({ title: t, href: h.startsWith('http') ? h : 'https://www.mss.go.kr' + h });
      });
      return r.slice(0, 12);
    });
    
    console.log(`Found ${posts.length} posts\n`);
    
    for (const post of posts) {
      try {
        await p.goto(post.href, { waitUntil: 'networkidle2', timeout: 20000 });
        await sleep(2000);
        
        const detail = await p.evaluate(() => {
          const text = (document.body?.innerText || '').substring(0, 5000);
          return {
            title: document.querySelector('h1, h2, .subject, .view_title')?.textContent?.trim() || '',
            content: text,
          };
        });
        
        if (!detail.title) { console.log(`  SKIP (no title): ${post.href.substring(0,60)}`); continue; }
        
        const ok = await postGrant({
          title: detail.title,
          organization: '중소벤처기업부',
          category: guessCategory(detail.title + ' ' + detail.content),
          applyEnd: findDate(detail.content),
          content: detail.content.substring(0, 3000),
          source: 'SMBA',
          sourceId: 'mss-' + post.href.split('?')[1]?.substring(0, 50) || Date.now(),
          url: post.href,
        });
        
        if (ok) { count++; console.log(`  ✅ ${detail.title.substring(0, 50)}`); }
        await sleep(500);
      } catch (e) { console.log(`  ⚠️ ${e.message.substring(0, 60)}`); }
    }
  } finally { await b.close(); }
  console.log(`\n🏁 ${count} new grants saved`);
}

function guessCategory(text) {
  const t = text.toLowerCase();
  if (/r&d|연구|기술개발|rnd/i.test(t)) return 'R&D';
  if (/창업|스타트업|벤처|startup/i.test(t)) return '창업';
  if (/수출|해외|무역|글로벌|export/i.test(t)) return '수출';
  if (/제조|스마트|자동화|공정/i.test(t)) return '제조혁신';
  if (/인력|채용|고용|교육|일자리/i.test(t)) return '인력';
  if (/마케팅|홍보|판로|브랜드|전시/i.test(t)) return '마케팅';
  return '기타';
}

function findDate(text) {
  if (!text) return null;
  const m = text.match(/(\d{4})[-.](\d{2})[-.](\d{2})/g) || text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g);
  if (!m) return null;
  return m[m.length-1].replace(/[년월일\s]/g, '-').replace(/\./g, '-').replace(/--/g, '-');
}

function postGrant(data) {
  return new Promise(resolve => {
    const body = JSON.stringify({ ...data, applyStart: '2026-06-01', budget: '', eligibility: '', requirements: '' });
    const req = http.request(API + '/grants/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => {
      resolve(res.statusCode === 200 || res.statusCode === 201);
    });
    req.on('error', () => resolve(false));
    req.write(body); req.end();
  });
}

scrape().catch(console.error);
