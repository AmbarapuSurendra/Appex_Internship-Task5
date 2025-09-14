
// GlobeMart demo script - vanilla JS
(() => {
  const PROD_KEY = 'globemart_products';
  const CART_KEY = 'globemart_cart';
  const USERS_KEY = 'globemart_users';
  const CURR_KEY = 'globemart_currentUser';

// Seed products (if not already present) with local images
const seed = [
  { id:101, title:'Wireless Headphones', category:'electronics', price:2499, desc:'Wireless earbuds with good bass', img:'images/assets/wireless_earbuds.jpg' },
  { id:102, title:'Smart Watch',        category:'electronics', price:4999, desc:'Fitness & notification watch', img:'images/assets/smart_watch.jpeg' },
  { id:103, title:'Espresso Machine',   category:'home',        price:7999, desc:'Compact espresso maker', img:'images/assets/espresso_machine.jpeg' },
  { id:104, title:'Air Purifier',       category:'home',        price:5999, desc:'HEPA air purifier', img:'images/assets/air_purifier.jpg' },
  { id:105, title:'Yoga Mat',           category:'fitness',     price:899,  desc:'Non-slip yoga mat', img:'images/assets/yoga_mat.jpeg' },
  { id:106, title:'Running Shoes',      category:'fashion',     price:3499, desc:'Lightweight running shoes', img:'images/assets/running_shoes.jpg' },
  { id:107, title:'Bluetooth Speaker',  category:'electronics', price:2499, desc:'Portable bluetooth speaker', img:'images/assets/bluetooth_speaker.jpeg' },
  { id:108, title:'Desk Lamp',          category:'home',        price:1299, desc:'LED desk lamp', img:'images/assets/desk_lamp.jpg' }
];
if(!localStorage.getItem(PROD_KEY)) localStorage.setItem(PROD_KEY, JSON.stringify(seed));

  // Helpers
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const load = k => JSON.parse(localStorage.getItem(k) || 'null');
  const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
  const getProducts = () => JSON.parse(localStorage.getItem(PROD_KEY) || '[]');
  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  // Cart utils
  const addToCart = (id, qty=1) => {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if(item) item.qty += qty; else cart.push({id, qty});
    save(CART_KEY, cart); updateCartCount(); toast('Added to cart');
  };
  const removeFromCart = id => {
    let cart = getCart().filter(i => i.id !== id);
    save(CART_KEY, cart); updateCartCount();
  };
  const changeQty = (id, qty) => {
    const cart = getCart();
    const it = cart.find(i => i.id === id);
    if(it){ it.qty = qty; if(it.qty<=0) removeFromCart(id); save(CART_KEY, cart); updateCartCount(); }
  };

  // Auth simple
  const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const saveUser = u => { const users = getUsers(); users.push(u); save(USERS_KEY, users); };
  const findUser = email => getUsers().find(u => u.email === email);
  const setCurrent = u => save(CURR_KEY, u);
  const getCurrent = () => JSON.parse(localStorage.getItem(CURR_KEY) || 'null');
  const logout = () => { localStorage.removeItem(CURR_KEY); updateAuthUI(); };

  // UI updates
  function updateCartCount(){
    const count = getCart().reduce((s,i)=>s+i.qty,0);
    $$('#cart-count,#cart-count-2,#cart-count-3,#cart-count-4,#cart-count-5,#cart-count-6,#cart-count-7,#cart-count-8,#cart-count-9').forEach(el => { if(el) el.textContent = count; });
  }
  function updateAuthUI(){
    const user = getCurrent();
    $$('#auth-link,#auth-link-2,#auth-link-3,#auth-link-4,#auth-link-5,#auth-link-6,#auth-link-7,#auth-link-8,#auth-link-9').forEach(a => {
      if(!a) return;
      if(user){ a.textContent = 'Logout'; a.href = '#'; a.onclick = e => { e.preventDefault(); logout(); } }
      else { a.textContent = 'Login'; a.href = 'login.html'; a.onclick = null; }
    });
  }

  // Toast
  function toast(msg){
    const t = document.createElement('div'); t.textContent = msg; t.style.position='fixed'; t.style.right='1rem'; t.style.bottom='1rem'; t.style.padding='.6rem'; t.style.background='white'; t.style.borderRadius='6px'; t.style.boxShadow='0 6px 18px rgba(11,18,32,0.08)'; document.body.appendChild(t);
    setTimeout(()=>t.remove(),1400);
  }

  // Render products list
  function renderProducts(area, products){
    if(!area) return;
    area.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<img loading="lazy" src="${p.img}" alt="${p.title}" /><h4>${p.title}</h4><div class="muted">${p.category}</div><div class="price">₹${p.price}</div><div style="margin-top:.4rem"><button class="btn add" data-id="${p.id}">Add to cart</button> <a class="small" href="product.html?id=${p.id}">View</a></div>`;
      area.appendChild(card);
    });
    $$('.add').forEach(b => b.addEventListener('click', e => addToCart(Number(e.currentTarget.dataset.id))));
  }

  // Product detail
  function renderProductDetail(target, id){
    if(!target) return;
    const products = getProducts();
    const p = products.find(x => x.id === Number(id));
    if(!p){ target.innerHTML = '<p class="muted">Product not found</p>'; return; }
    target.innerHTML = `<div class="card"><img src="${p.img}" alt="${p.title}" /></div><div><h2>${p.title}</h2><p class="muted">${p.category}</p><p>${p.desc}</p><p class="price">₹${p.price}</p><label>Qty<select id="qty"><option>1</option><option>2</option><option>3</option></select></label><div style="margin-top:.6rem"><button class="btn" id="add-product">Add to Cart</button></div></div>`;
    $('#add-product').addEventListener('click', ()=> { const q = Number($('#qty').value || 1); addToCart(p.id, q); });
  }

  // Cart render
  function renderCart(container, summary){
    if(!container) return;
    const cart = getCart(); const products = getProducts();
    if(cart.length===0){ container.innerHTML = '<p class="muted">Your cart is empty.</p>'; summary.innerHTML=''; return; }
    container.innerHTML = '';
    let total = 0;
    cart.forEach(ci => {
      const p = products.find(x => x.id === ci.id);
      const row = document.createElement('div'); row.className='cart-row';
      row.innerHTML = `<img src="${p.img}" alt="${p.title}" style="width:120px;height:80px;object-fit:cover;border-radius:6px"/><div style="flex:1"><strong>${p.title}</strong><div class="muted">₹${p.price}</div></div><div><input type="number" min="1" value="${ci.qty}" style="width:60px"/></div><div><button class="btn remove" data-id="${p.id}">Remove</button></div>`;
      container.appendChild(row);
      total += p.price * ci.qty;
      row.querySelector('input').addEventListener('change', e => changeQty(p.id, Number(e.target.value)));
      row.querySelector('.remove').addEventListener('click', () => { removeFromCart(p.id); renderCart(container, summary); });
    });
    summary.innerHTML = `<div class="card"><strong>Total: ₹${total}</strong><div style="margin-top:.6rem"><button class="btn" id="checkout">Checkout</button></div></div>`;
    $('#checkout').addEventListener('click', ()=> { if(confirm('Proceed to demo checkout?')){ localStorage.removeItem(CART_KEY); updateCartCount(); renderCart(container, summary); alert('Order placed (demo)'); } });
  }

  // Init pages
  document.addEventListener('DOMContentLoaded', ()=>{
    updateCartCount(); updateAuthUI();

    // Products page
    const productList = $('#product-list');
    if(productList){
      const products = getProducts();
      renderProducts(productList, products);
      $('#filter-category')?.addEventListener('change', ()=> { const cat = $('#filter-category').value; const max = Number($('#max-price').value || Infinity); let out = products.slice(); if(cat !== 'all') out = out.filter(p => p.category === cat); out = out.filter(p => p.price <= max); const sort = $('#sort').value; if(sort === 'price-asc') out.sort((a,b)=>a.price-b.price); if(sort === 'price-desc') out.sort((a,b)=>b.price-a.price); renderProducts(productList, out); $('#results-count').textContent = `Showing ${out.length} products`; });
      $('#sort')?.addEventListener('change', ()=> { $('#filter-category').dispatchEvent(new Event('change')); });
      $('#max-price')?.addEventListener('input', ()=> { $('#filter-category').dispatchEvent(new Event('change')); });
      $('#search-btn-2')?.addEventListener('click', ()=> { const q = $('#global-search')?.value.trim().toLowerCase(); const out = products.filter(p=>p.title.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)); renderProducts(productList, out); $('#results-count').textContent=`Showing ${out.length} products`; });
    }

    // Product detail page
    const detail = $('#product-detail');
    if(detail){
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      renderProductDetail(detail, id);
    }

    // Cart page
    const cartContainer = $('#cart-items');
    const cartSummary = $('#cart-summary');
    if(cartContainer) renderCart(cartContainer, cartSummary);

    // Register form
    const reg = $('#register-form');
    if(reg){
      reg.addEventListener('submit', e => {
        e.preventDefault();
        const name = $('#reg-name').value.trim();
        const email = $('#reg-email').value.trim().toLowerCase();
        const pw = $('#reg-password').value;
        if(!name || !email || pw.length < 6){ $('#reg-feedback').textContent = 'Provide valid details (password min 6 chars)'; return; }
        if(findUser(email)){ $('#reg-feedback').textContent = 'Account exists'; return; }
        saveUser({name, email, password: btoa(pw)});
        $('#reg-feedback').textContent = 'Account created. You may login.';
        reg.reset();
      });
    }

    // Login form
    const login = $('#login-form');
    if(login){
      login.addEventListener('submit', e => {
        e.preventDefault();
        const email = $('#login-email').value.trim().toLowerCase();
        const pw = $('#login-password').value;
        const u = findUser(email);
        if(!u || u.password !== btoa(pw)){ $('#login-feedback').textContent = 'Invalid credentials'; return; }
        setCurrent({name: u.name, email: u.email});
        $('#login-feedback').textContent = 'Logged in'; updateAuthUI();
        setTimeout(()=> location.href = 'index.html', 500);
      });
    }

    // Contact form
    const contact = $('#contact-form');
    if(contact){
      contact.addEventListener('submit', e => { e.preventDefault(); const name = $('#contact-name').value.trim(); const email = $('#contact-email').value.trim(); const msg = $('#contact-message').value.trim(); if(!name||!email||!msg){ $('#contact-feedback').textContent = 'Please fill all fields'; return; } $('#contact-feedback').textContent = 'Thanks! Message recorded locally (demo)'; contact.reset(); });
    }

    // Search from header
    $('#search-btn')?.addEventListener('click', ()=> { const q = $('#global-search').value.trim(); if(q) location.href = `products.html`; });

  });
})();
