/**
 * BizGrant 외부 수집기 — JavaScript 렌더링이 필요한 정부 사이트용
 * 사용법: node collectors/run-external.cjs [mss|all]
 */
const puppeteer = require('puppeteer-core');
const http = require('http');
const API = process.env.BIZGRANT_API || 'http://localhost:8082/api';
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SOURCES = {
  mss: {
    label: '중소벤처기업부',
    source: 'MSS',
    listUrl: 'https://www.mss.go.kr/site/smba/ex/bbs/List.do?cbIdx=81',
    baseUrl: 'https://www.mss.go.kr',
    organization: '중소벤처기업부',
    maxItems: 20,
  },
};

async function scrapeSource(key) {
  const cfg = SOURCES[key];
  if (!cfg) throw new Error(`Unknown source: ${key}`);

  console.log(`\n🦞 ${cfg.label} 수집 시작`);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });

  let saved = 0;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(cfg.listUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(3000);

    const posts = await page.evaluate((baseUrl) => {
      const rows = [];
      const seen = new Set();
      document.querySelectorAll('table tbody tr a[href]').forEach((a) => {
        const title = a.textContent.trim();
        const href = a.getAttribute('href') || '';
        if (title.length < 10) return;
        if (href.includes('List.do') || href.includes('javascript')) return;
        const url = href.startsWith('http') ? href : baseUrl + href;
        if (seen.has(url)) return;
        seen.add(url);
        rows.push({ title, url });
      });
      return rows.slice(0, 20);
    }, cfg.baseUrl);

    console.log(`  목록 ${posts.length}건`);

    for (const post of posts.slice(0, cfg.maxItems)) {
      try {
        await page.goto(post.url, { waitUntil: 'networkidle2', timeout: 20000 });
        await sleep(1500);
        const detail = await page.evaluate(() => ({
          title: document.querySelector('h1, h2, .subject, .view_title')?.textContent?.trim() || '',
          content: (document.body?.innerText || '').substring(0, 4000),
        }));

        const title = detail.title || post.title;
        const sourceId = `${key}-${post.url.split('?')[1] || Math.abs(post.url.hashCode?.() || Date.now())}`;
        const ok = await postGrant({
          title,
          organization: cfg.organization,
          category: guessCategory(title + ' ' + detail.content),
          applyEnd: findDate(detail.content),
          content: detail.content,
          source: cfg.source,
          sourceId: sourceId.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 80),
          url: post.url,
        });
        if (ok) {
          saved++;
          console.log(`  ✅ ${title.slice(0, 50)}`);
        }
        await sleep(500);
      } catch (e) {
        console.log(`  ⚠️ ${e.message.slice(0, 60)}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`🏁 ${cfg.label}: ${saved}건 저장`);
  return saved;
}

function guessCategory(text) {
  if (/r&d|연구|기술개발|rnd/i.test(text)) return 'R&D';
  if (/창업|스타트업|벤처|startup/i.test(text)) return '창업';
  if (/수출|해외|무역|글로벌/i.test(text)) return '수출';
  if (/제조|스마트|자동화|공정/i.test(text)) return '제조혁신';
  if (/인력|채용|고용|교육|일자리/i.test(text)) return '인력';
  if (/마케팅|홍보|판로|브랜드|전시/i.test(text)) return '마케팅';
  return '기타';
}

function findDate(text) {
  if (!text) return null;
  const m = text.match(/(\d{4})[-.](\d{2})[-.](\d{2})/g);
  return m ? m[m.length - 1] : null;
}

function postGrant(data) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      ...data,
      applyStart: null,
      budget: '',
      eligibility: '',
      requirements: '',
    });
    const req = http.request(`${API}/grants/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => resolve(res.statusCode === 200));
    });
    req.on('error', () => resolve(false));
    req.write(body);
    req.end();
  });
}

async function main() {
  const arg = process.argv[2] || 'mss';
  if (arg === 'all') {
    for (const key of Object.keys(SOURCES)) {
      await scrapeSource(key);
    }
  } else {
    await scrapeSource(arg);
  }
}

main().catch(console.error);
