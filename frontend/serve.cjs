const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST = path.join(__dirname, 'dist');
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback
      filePath = path.join(DIST, 'index.html');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/html' });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, () => {
  console.log(`GrantHunter Frontend: http://localhost:${PORT}`);
});
