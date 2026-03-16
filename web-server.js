// Simple HTTP Server to serve static files
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5501;
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
  // Default to index.html for root
  // Remove query string and fragment so '/customer.html?' or '/page.html?foo=bar' maps correctly
  let requestPath = req.url.split('?')[0].split('#')[0];
  let filePath = requestPath === '/' ? '/index.html' : requestPath;
  filePath = path.join(PUBLIC_DIR, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Log each request for debugging
  console.log('🔍', req.method, req.url, '->', filePath);

  // Try to serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try .html extension if no file found
      if (err.code === 'ENOENT' && !filePath.endsWith('.html')) {
        return fs.readFile(filePath + '.html', (err2, data2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data2);
          }
        });
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'text/plain';
    
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🌐 Web Server running on http://localhost:${PORT}`);
  console.log(`📂 Serving files from: ${PUBLIC_DIR}`);
  console.log(`\n✅ Open http://localhost:${PORT}/mechanic-verify.html in your browser\n`);
});
