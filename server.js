// Tiny dependency-free server for Mughi's Mushroom.
// Serves ./src and a few deliberately slow / stateful API routes.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'src');

const PRODUCTS = [
  { id: 'oyster', name: 'Oyster Mushrooms' },
  { id: 'milky', name: 'Milky Mushrooms' },
  { id: 'button', name: 'Button Mushrooms' },
  { id: 'shiitake', name: 'Shiitake Mushrooms' },
  { id: 'portobello', name: 'Portobello Mushrooms' },
  { id: 'wild', name: 'Wild Mushrooms' },
  { id: 'tofu', name: 'Tofu' },
  { id: 'soya-milk', name: 'Soya Milk' },
  { id: 'almond-milk', name: 'Almond Milk' },
];
const STOCK = {
  oyster: { price: '$4.99', stock: 'In stock' },
  milky: { price: '$3.99', stock: 'In stock' },
  button: { price: '$2.99', stock: 'In stock' },
  shiitake: { price: '$6.49', stock: 'Only 2 left' },
  portobello: { price: '$5.49', stock: 'In stock' },
  wild: { price: '$8.99', stock: 'Only 3 left' },
  tofu: { price: '$2.49', stock: 'In stock' },
  'soya-milk': { price: '$1.99', stock: 'In stock' },
  'almond-milk': { price: '$3.29', stock: 'In stock' },
};

// FLAKE SWITCHES -------------------------------------------------------------
// Random whole number in [min, max). Used to make response times unpredictable.
const jitter = (min, max) => min + Math.floor(Math.random() * (max - min));
const PRODUCTS_DELAY = () => jitter(1500, 3500);  // 02-hard-wait
const STOCK_DELAY = () => jitter(500, 1500);      // 06-network-race
const VALIDATE_DELAY = () => 1500;                // 04-loading-state

// In-memory user store, lives as long as the server (07-parallel-collision).
const registered = new Set();

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

// Replies with JSON after an optional delay. The delay is how we simulate a slow API.
function sendJSON(res, status, body, delayMs = 0) {
  setTimeout(() => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  }, delayMs);
}

// Single request handler: API routes first, then falls through to static files.
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost'); // base is only needed so URL() can parse a path

  // Product names: slow on purpose (02-hard-wait).
  if (req.method === 'GET' && url.pathname === '/api/products') {
    return sendJSON(res, 200, PRODUCTS, PRODUCTS_DELAY());
  }
  // Price + availability: a second, slower call after the product rows exist (06-network-race).
  if (req.method === 'GET' && url.pathname === '/api/stock') {
    return sendJSON(res, 200, STOCK, STOCK_DELAY());
  }
  // Cart validation: the front-end ignores checkout clicks until this returns (04-loading-state).
  if (req.method === 'POST' && url.pathname === '/api/validate-cart') {
    return sendJSON(res, 200, { valid: true }, VALIDATE_DELAY());
  }
  // Sign-up: rejects an e-mail that was already registered since the server started (07-parallel-collision).
  if (req.method === 'POST' && url.pathname === '/api/signup') {
    let raw = ''; // request body arrives in chunks, so collect it first
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      let email = '';
      try { email = String(JSON.parse(raw).email || '').trim().toLowerCase(); } catch {}
      if (!email) return sendJSON(res, 400, { error: 'Email is required' });
      if (registered.has(email)) return sendJSON(res, 409, { error: 'Email already registered' }, 200);
      registered.add(email);
      return sendJSON(res, 201, { email }, 200);
    });
    return;
  }

  // Static files from ./src. '/' maps to index.html.
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  const full = path.normalize(path.join(ROOT, file));
  // Block path traversal (../), missing files and directories.
  if (!full.startsWith(ROOT) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404);
    return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'text/plain', 'Cache-Control': 'no-store' });
  fs.createReadStream(full).pipe(res);
});

server.listen(PORT, () => console.log(`Mughi's Mushroom running on http://localhost:${PORT}`));
