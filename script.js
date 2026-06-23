// App State Tracker
let productsData = [];
let cart = {};

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const emptyCartView = document.getElementById('empty-cart-view');
const activeCartView = document.getElementById('active-cart-view');
const cartList = document.getElementById('cart-list');
const cartTotalPrice = document.getElementById('cart-total-price');
const confirmOrderBtn = document.getElementById('confirm-order-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalSummaryList = document.getElementById('modal-summary-list');
const modalTotalPrice = document.getElementById('modal-total-price');
const startNewOrderBtn = document.getElementById('start-new-order-btn');

// 1. Fetch Product data from local JSON
async function fetchProducts() {
  try {
    const response = await fetch('./data.json');
    productsData = await response.json();
    renderProducts();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// 2. Render Product Cards dynamically
function renderProducts() {
  productsGrid.innerHTML = '';
  
  productsData.forEach((product, index) => {
    const quantity = cart[product.name] ? cart[product.name].quantity : 0;
    const isAdded = quantity > 0;

    const productCard = document.createElement('article');
    productCard.className = `product-card ${isAdded ? 'selected-border' : ''}`;
    
    // Set dynamic responsive images depending on viewport screen sizes
    productCard.innerHTML = `
      <div class="image-container">
        <picture>
          <source media="(min-width: 1024px)" srcset="${product.image.desktop}">
          <source media="(min-width: 768px)" srcset="${product.image.tablet}">
          <img src="${product.image.mobile}" alt="${product.name}" class="product-img">
        </picture>
        
        ${!isAdded ? 
          `<button class="btn-add-to-cart" onclick="addToCart('${product.name}', ${index})">
            <img src="./assets/images/icon-add-to-cart.svg" alt=""> Add to Cart
           </button>` : 
          `<div class="btn-quantity-control">
            <button onclick="changeQuantity('${product.name}', -1)">
              <img src="./assets/images/icon-decrement-quantity.svg" alt="Decrease">
            </button>
            <span>${quantity}</span>
            <button onclick="changeQuantity('${product.name}', 1)">
              <img src="./assets/images/icon-increment-quantity.svg" alt="Increase">
            </button>
           </div>`
        }
      </div>
      <p class="product-category">${product.category}</p>
      <h2 class="product-title">${product.name}</h2>
      <span class="product-price">$${product.price.toFixed(2)}</span>
    `;
    productsGrid.appendChild(productCard);
  });
}

// 3. Cart Actions
window.addToCart = function(name, index) {
  const itemData = productsData[index];
  cart[name] = {
    price: itemData.price,
    quantity: 1,
    thumbnail: itemData.image.thumbnail
  };
  updateAppUI();
};

window.changeQuantity = function(name, change) {
  if (!cart[name]) return;
  cart[name].quantity += change;
  if (cart[name].quantity <= 0) {
    delete cart[name];
  }
  updateAppUI();
};

window.removeFromCart = function(name) {
  delete cart[name];
  updateAppUI();
};

// 4. Update UI Sync Blocks
function updateAppUI() {
  renderProducts();
  renderCart();
}

function renderCart() {
  const cartKeys = Object.keys(cart);
  let totalItemsCount = 0;
  let runningTotalCost = 0;

  cartList.innerHTML = '';

  if (cartKeys.length === 0) {
    emptyCartView.classList.remove('hidden');
    activeCartView.classList.add('hidden');
    cartCount.innerText = '0';
    return;
  }

  emptyCartView.classList.add('hidden');
  activeCartView.classList.remove('hidden');

  cartKeys.forEach(name => {
    const item = cart[name];
    const itemCostTotal = item.price * item.quantity;
    totalItemsCount += item.quantity;
    runningTotalCost += itemCostTotal;

    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item-details">
        <h3>${name}</h3>
        <p>
          <span class="qty">${item.quantity}x</span>
          <span class="unit-price">@ $${item.price.toFixed(2)}</span>
          <span class="total-item-price">$${itemCostTotal.toFixed(2)}</span>
        </p>
      </div>
      <button class="btn-remove-item" onclick="removeFromCart('${name}')" aria-label="Remove ${name}">
        <img src="./assets/images/icon-remove-item.svg" alt="">
      </button>
    `;
    cartList.appendChild(li);
  });

  cartCount.innerText = totalItemsCount;
  cartTotalPrice.innerText = `$${runningTotalCost.toFixed(2)}`;
}

// 5. Modal Triggers
confirmOrderBtn.addEventListener('click', () => {
  modalSummaryList.innerHTML = '';
  let runningTotalCost = 0;

  Object.keys(cart).forEach(name => {
    const item = cart[name];
    const itemCostTotal = item.price * item.quantity;
    runningTotalCost += itemCostTotal;

    const li = document.createElement('li');
    li.className = 'modal-item';
    li.innerHTML = `
      <div class="modal-item-left">
        <img src="${item.thumbnail}" alt="" class="modal-thumb">
        <div>
          <h3>${name}</h3>
          <p><span class="qty">${item.quantity}x</span> <span class="unit-price">@ $${item.price.toFixed(2)}</span></p>
        </div>
      </div>
      <strong class="modal-item-total">$${itemCostTotal.toFixed(2)}</strong>
    `;
    modalSummaryList.appendChild(li);
  });

  modalTotalPrice.innerText = `$${runningTotalCost.toFixed(2)}`;
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevents background body scrolling
});

// 6. Reset Application state
startNewOrderBtn.addEventListener('click', () => {
  cart = {};
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = 'auto';
  updateAppUI();
});

// Init execution
fetchProducts();
