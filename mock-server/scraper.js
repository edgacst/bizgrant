import { writeFileSync } from 'fs';

const BASE = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do';

// Categories from the API
const CATEGORIES = {
  '01': '금융', '02': '기술', '03': '인력',
  '04': '수출', '05': '내수', '06': '창업',
  '07': '경영', '09': '기타'
};

const OUR_KEYS = {
  '금융': '기타', '기술': 'R&D', '인력': '인력',
  '수출': '수출', '내수': '마케팅', '창업': '창업',
  '경영': '경영', '기타': '기타'
};

async function fetchGrants(page, categoryId) {
  try {
    const url = `${BASE}?dataType=rss&searchLclasId=${categoryId}&pageIndex=${page}&pageUnit=20`;
    const res = await fetch(url);
    const xml = await res.text();

    // Parse RSS XML manually (no need for xml2js dependency)
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = extractTag(item, 'title');
      const link = extractTag(item, 'link');
      const org = extractTag(item, 'author');
      const desc = extractTag(item, 'description');
      const id = extractTag(item, 'seq');
      const pubDate = extractTag(item, 'pubDate');

      if (!title || title.length < 5) continue;

      // Parse date from pubDate: "2026-06-09"
      const dateMatch = pubDate?.match(/(\d{4}-\d{2}-\d{2})/);
      const scrapedDate = dateMatch ? dateMatch[1] : '2026-06-09';

      items.push({
        id: 0, // Will be reassigned
        title: cleanText(title),
        organization: cleanText(org) || '중소벤처기업부',
        category: OUR_KEYS[CATEGORIES[categoryId]] || '기타',
        applyStart: scrapedDate,
        applyEnd: getEndDate(scrapedDate), // Estimate end date
        budget: '공고문 참조',
        eligibility: '공고문 참조',
        requirements: '공고문 참조',
        content: cleanText(desc?.substring(0, 200)) || title,
        originalUrl: link || `https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=${id || ''}`,
        source: 'bizinfo',
        scrapedAt: new Date().toISOString(),
      });
    }
    return items;
  } catch (e) {
    console.log(`  카테고리 ${categoryId} page ${page}: FAIL - ${e.message}`);
    return [];
  }
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? m[1].trim() : '';
}

function cleanText(text) {
  return text.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/\s+/g, ' ').trim();
}

function getEndDate(startDate) {
  // Estimate end date as 60 days from start
  try {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  } catch { return '2026-12-31'; }
}

// ── Main ──
console.log('🔍 GrantHunter Real Scraper\n');
console.log('Source: 기업마당 (bizinfo.go.kr) API');
console.log('');

let allGrants = [];
for (const [catId, catName] of Object.entries(CATEGORIES)) {
  for (let page = 1; page <= 2; page++) {
    process.stdout.write(`  ${catName}(${catId}) page ${page}... `);
    const items = await fetchGrants(page, catId);
    console.log(`${items.length}건`);
    allGrants.push(...items);
  }
}

// Deduplicate by title
const seen = new Set();
allGrants = allGrants.filter(g => {
  const key = g.title.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// Assign IDs
allGrants.forEach((g, i) => g.id = i + 1);

console.log(`\n📊 Total: ${allGrants.length} real grants from bizinfo.go.kr`);

writeFileSync('./scraped-grants.json', JSON.stringify(allGrants, null, 2), 'utf-8');
console.log('💾 Saved to scraped-grants.json');

// Preview
allGrants.slice(0, 8).forEach(g => {
  console.log(`  ${g.id}. [${g.category}] ${g.title.substring(0,55)}`);
});
