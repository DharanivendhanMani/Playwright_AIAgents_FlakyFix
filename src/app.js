// Mughi's Mushroom front-end. Every flake is deliberate and labelled with the test it feeds.
(function () {
  'use strict';

  const CATALOG = [
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
  const byId = Object.fromEntries(CATALOG.map((p) => [p.id, p]));

  // 01-brittle-locator: CSS class is regenerated on every page load (like CSS-in-JS hashes).
  const BTN_CLASS = 'css-' + Math.random().toString(36).slice(2, 8);

  // Shorthand: find an element by its id.
  const $ = (id) => document.getElementById(id);

  // ---- cart (localStorage) -------------------------------------------------
  // Read the cart (an array of product ids) from localStorage; empty array if none yet.
  const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
  // Save the cart array back to localStorage.
  const setCart = (c) => localStorage.setItem('cart', JSON.stringify(c));
  // Append one product id to the cart and refresh the cart UI.
  function addToCart(id) {
    setCart(getCart().concat(id));
    renderCart();
  }
  // Draw the cart badge count and the list of items in the checkout section.
  function renderCart() {
    const cart = getCart();
    $('cart-count').textContent = String(cart.length);
    $('cart-items').innerHTML = cart.map((id) => `<li>${byId[id].name}</li>`).join('');
  }

  // ---- 05-dynamic-content: recommendations are shuffled and re-labelled on every load
  // Show 4 random products in random order, each with a random "only N left" label.
  function renderRecommended() {
    const shuffled = CATALOG.slice(); // copy so CATALOG keeps its order
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.length = 4; // keep only the first 4 after shuffling
    $('recommended').innerHTML = shuffled
      .map((p) => {
        const left = 1 + Math.floor(Math.random() * 9);
        return `<li data-testid="rec-${p.id}">
          <span>${p.name} — only ${left} left!</span>
          <button type="button" aria-label="Add ${p.name} from recommendations" data-add="${p.id}">Add</button>
        </li>`;
      })
      .join('');
  }

  // ---- product list: slow endpoint (02) then slower stock endpoint (06) ----
  // Two sequential API calls: (1) products -> render rows with placeholders, (2) stock -> fill price/stock.
  async function loadProducts() {
    const products = await (await fetch('/api/products', { cache: 'no-store' })).json();
    $('loading').remove(); // hide "Loading products…" once rows are about to appear
    $('product-list').innerHTML = products
      .map(
        (p) => `<div class="product-row" data-testid="product-${p.id}">
          <span class="name">${p.name}</span>
          <span class="price">…</span>
          <span class="stock">…</span>
          <button type="button" class="${BTN_CLASS}" aria-label="Add ${p.name} to cart" data-add="${p.id}">Add to cart</button>
        </div>`
      )
      .join('');

    // 06-network-race: price & stock arrive from a second, slower API after the rows exist.
    const stock = await (await fetch('/api/stock', { cache: 'no-store' })).json();
    for (const p of products) {
      const row = document.querySelector(`[data-testid="product-${p.id}"]`);
      row.querySelector('.price').textContent = stock[p.id].price;
      row.querySelector('.stock').textContent = stock[p.id].stock;
    }
  }

  // ---- 04-loading-state: checkout ignores clicks until cart validation finishes
  let validating = true; // true until the validate-cart call returns
  // Calls the slow validation endpoint, then unlocks checkout and hides the spinner.
  async function validateCart() {
    await fetch('/api/validate-cart', { method: 'POST' });
    validating = false;
    $('spinner').hidden = true;
  }
  // "Place order": does nothing while validating or with an empty cart, otherwise shows the confirmation.
  $('place-order').addEventListener('click', () => {
    if (validating) return; // silently ignored while the spinner is showing
    if (getCart().length === 0) return;
    $('order-confirmation').hidden = false;
  });

  // ---- 07-parallel-collision: server rejects duplicate e-mails -------------
  // Sign-up form: posts the e-mail to the server and shows either a welcome message or the server's error.
  $('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // stay on the page instead of a full form submit
    const email = $('email').value;
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const body = await res.json();
    $('signup-result').textContent = res.ok ? `Welcome, ${body.email}!` : body.error;
  });

  // ---- wire up ---------------------------------------------------------------
  // One delegated click handler for every "Add" button (product rows and recommendations),
  // identified by their data-add attribute. Works for buttons rendered later.
  document.addEventListener('click', (e) => {
    const id = e.target && e.target.getAttribute && e.target.getAttribute('data-add');
    if (id) addToCart(id);
  });

  // Start-up: draw what we can immediately, then kick off the two async loads.
  renderRecommended();
  renderCart();
  loadProducts();
  validateCart();
})();
