// Product Detail Page Script - Dora Elektronik

// ── DORA Security Layer ──────────────────────────────────────────────────
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

const _pLoginAttempts = { count: 0, lockedUntil: 0 };
function pIsLoginLocked() {
    if (_pLoginAttempts.lockedUntil > Date.now()) {
        return Math.ceil((_pLoginAttempts.lockedUntil - Date.now()) / 1000);
    }
    return 0;
}
function pRecordLoginFailure() {
    _pLoginAttempts.count++;
    if (_pLoginAttempts.count >= 5) {
        _pLoginAttempts.lockedUntil = Date.now() + 30000;
        _pLoginAttempts.count = 0;
    }
}
function pResetLoginAttempts() {
    _pLoginAttempts.count = 0;
    _pLoginAttempts.lockedUntil = 0;
}

const _pSubmitTimestamps = {};
function pIsRateLimited(formId, limitMs = 2000) {
    const now = Date.now();
    if (_pSubmitTimestamps[formId] && (now - _pSubmitTimestamps[formId]) < limitMs) return true;
    _pSubmitTimestamps[formId] = now;
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
// Inject Yellow Stars CSS directly to bypass browser cache
const styleTag = document.createElement('style');
styleTag.innerHTML = `
.review-stars i.fa-solid, 
.avg-score-stars i.fa-solid, 
.rating-bar-stars i.fa-solid, 
.order-star-select.active, 
.order-star-select.hover, 
.rating-stars-input i.active,
.rating-icon i.fa-solid {
    color: #FFD700 !important;
    text-shadow: 0 0 4px rgba(255, 215, 0, 0.8), 0 0 10px rgba(255, 215, 0, 0.4) !important;
}
.review-stars i.fa-regular,
.avg-score-stars i.fa-regular,
.rating-bar-stars i.fa-regular {
    color: #cccccc !important;
    text-shadow: none !important;
}
`;
document.head.appendChild(styleTag);

let currentProduct = null;
let selectedSize = null;
let activeCoupon = null;
let selectedRating = 5;

// DOM Elements
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

// Product Detail Page Elements
const detailProductImg = document.getElementById('detail-product-img');
const detailBrand = document.getElementById('detail-brand');
const detailTitle = document.getElementById('detail-title');
const detailOldPrice = document.getElementById('detail-old-price');
const detailNewPrice = document.getElementById('detail-new-price');
const detailDiscountBadge = document.getElementById('detail-discount-badge');
const detailDesc = document.getElementById('detail-desc');
const detailSizesContainer = document.getElementById('detail-sizes');
const detailStockStatus = document.getElementById('detail-stock-status');
const detailAddToCartBtn = document.getElementById('detail-add-to-cart-btn');
const relatedGrid = document.getElementById('related-grid');

// Reviews Elements
const reviewsList = document.getElementById('reviews-list');
const reviewsCountTab = document.getElementById('reviews-count-tab');
const reviewForm = document.getElementById('review-form');
const ratingStarsInput = document.getElementById('rating-stars-input');
const searchInput = document.getElementById('search-input');
const couponInput = document.getElementById('coupon-input');
const applyCouponBtn = document.getElementById('apply-coupon-btn');
const couponMessage = document.getElementById('coupon-message');

// Initialize Detail Page
function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    currentProduct = db.getProductById(productId);

    if (!currentProduct) {
        window.location.href = 'index.html';
        return;
    }

    // Render Navbar & Details
    renderAuthNavbar();
    renderProductDetails();
    renderRelatedProducts();
    updateCart();
    renderReviews();
    setupRatingStarsInput();

    // Event listeners
    setupEventListeners();
    setupTabListeners();
    setupGalleryListeners();
    setupCardInputFormatters();

    // Setup quantity selector
    const qtyMinusBtn = document.getElementById('qty-minus');
    const qtyPlusBtn = document.getElementById('qty-plus');
    const qtyInput = document.getElementById('qty-input');
    if (qtyMinusBtn && qtyPlusBtn && qtyInput) {
        qtyInput.value = 1;
        
        const updateQtyUI = () => {
            let val = parseInt(qtyInput.value);
            if (val <= 1) {
                qtyMinusBtn.style.opacity = '0.3';
                qtyMinusBtn.style.cursor = 'not-allowed';
            } else {
                qtyMinusBtn.style.opacity = '1';
                qtyMinusBtn.style.cursor = 'pointer';
            }
            
            if (val >= currentProduct.stock) {
                qtyPlusBtn.style.opacity = '0.3';
                qtyPlusBtn.style.cursor = 'not-allowed';
            } else {
                qtyPlusBtn.style.opacity = '1';
                qtyPlusBtn.style.cursor = 'pointer';
            }
        };
        
        updateQtyUI();
        
        qtyMinusBtn.onclick = () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
                updateQtyUI();
            }
        };
        qtyPlusBtn.onclick = () => {
            let val = parseInt(qtyInput.value);
            if (val < currentProduct.stock) {
                qtyInput.value = val + 1;
                updateQtyUI();
            } else {
                showToast(`Mevcut stok sınırına ulaşıldı (${currentProduct.stock} adet).`);
            }
        };
        // Expose updateQtyUI globally or save ref
        window.updateDetailQtyUI = updateQtyUI;
    }
}

// Render Header Authentication Area in Navbar
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

// Render Product details on screen
function renderProductDetails() {
    detailProductImg.src = currentProduct.image;
    detailProductImg.alt = currentProduct.title;
    detailBrand.innerText = currentProduct.brand;
    detailTitle.innerText = currentProduct.title;
    detailDesc.innerText = currentProduct.description;

    detailOldPrice.innerText = `${currentProduct.oldPrice.toLocaleString('tr-TR')} TL`;
    detailNewPrice.innerText = `${currentProduct.newPrice.toLocaleString('tr-TR')} TL`;
    const discountPercent = Math.round(((currentProduct.oldPrice - currentProduct.newPrice) / currentProduct.oldPrice) * 100);
    detailDiscountBadge.innerText = `%${discountPercent} İndirim`;

    // Dynamic Corner Stock Badge and Detail stock warning
    const detailStockBadge = document.getElementById('detail-stock-badge');
    if (currentProduct.stock === 0) {
        detailStockBadge.className = 'stock-badge badge-warning';
        detailStockBadge.innerText = 'Tükendi';
        detailStockStatus.innerHTML = `<span class="stock-warning">Ürün tükendi! En kısa sürede güncellenecektir.</span>`;
        detailAddToCartBtn.disabled = true;
        detailAddToCartBtn.style.opacity = '0.5';
        detailAddToCartBtn.innerText = 'Tükendi';
    } else if (currentProduct.stock <= 3) {
        detailStockBadge.className = 'stock-badge badge-warning';
        detailStockBadge.innerText = 'Tükenmek Üzere';
        detailStockStatus.innerHTML = `<span class="stock-warning">Sadece son ${currentProduct.stock} ürün kaldı!</span>`;
        detailAddToCartBtn.disabled = false;
        detailAddToCartBtn.style.opacity = '1';
        detailAddToCartBtn.innerText = 'Sepete Ekle';
    } else {
        detailStockBadge.className = 'stock-badge badge-info';
        detailStockBadge.innerText = `Stok: ${currentProduct.stock} Adet`;
        detailStockStatus.innerHTML = `<span class="stock-normal">Stokta Var (${currentProduct.stock} Adet)</span>`;
        detailAddToCartBtn.disabled = false;
        detailAddToCartBtn.style.opacity = '1';
        detailAddToCartBtn.innerText = 'Sepete Ekle';
    }

    // Dynamic Option/Size selector
    detailSizesContainer.innerHTML = '';
    document.getElementById('selector-title').innerText = 'Renk/Model Seçin';
    
    const sizeGuideLink = document.getElementById('size-guide-link');
    if (sizeGuideLink) {
        sizeGuideLink.style.display = 'inline-flex';
    }

    currentProduct.sizes.forEach((size, idx) => {
        const btn = document.createElement('button');
        btn.className = 'size-btn';
        if (idx === 0) {
            btn.classList.add('active');
            selectedSize = size;
        }
        btn.innerText = size;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = size;
        });
        detailSizesContainer.appendChild(btn);
    });

    // Add To Cart Event
    detailAddToCartBtn.onclick = () => {
        const qtyInput = document.getElementById('qty-input');
        const qty = qtyInput ? parseInt(qtyInput.value) : 1;
        addToCart(currentProduct.id, selectedSize, qty, detailAddToCartBtn);
        if (qtyInput) {
            qtyInput.value = 1;
            if (window.updateDetailQtyUI) window.updateDetailQtyUI();
        }
    };
}

// Gallery poses
function setupGalleryListeners() {
    const thumbPose1 = document.getElementById('thumb-pose-1');
    const thumbPose2 = document.getElementById('thumb-pose-2');
    const thumbImg1 = document.getElementById('detail-thumb-img-1');
    const thumbImg2 = document.getElementById('detail-thumb-img-2');
    const zoomImgContainer = document.getElementById('zoom-img-container');

    thumbImg1.src = currentProduct.image;
    thumbImg2.src = currentProduct.image;

    detailProductImg.dataset.pose = '1';
    detailProductImg.style.transform = 'scale(1) scaleX(1)';

    thumbPose1.addEventListener('click', () => {
        thumbPose1.classList.add('active');
        thumbPose2.classList.remove('active');
        detailProductImg.dataset.pose = '1';
        detailProductImg.style.transform = 'scale(1) scaleX(1)';
        detailProductImg.classList.remove('gallery-fade');
        void detailProductImg.offsetWidth;
        detailProductImg.classList.add('gallery-fade');
    });

    thumbPose2.addEventListener('click', () => {
        thumbPose2.classList.add('active');
        thumbPose1.classList.remove('active');
        detailProductImg.dataset.pose = '2';
        detailProductImg.style.transform = 'scale(1) scaleX(-1)';
        detailProductImg.classList.remove('gallery-fade');
        void detailProductImg.offsetWidth;
        detailProductImg.classList.add('gallery-fade');
    });

    // Büyüteç coordinate calculations
    zoomImgContainer.addEventListener('mousemove', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const isPose2 = detailProductImg.dataset.pose === '2';
        const scaleXValue = isPose2 ? '-1' : '1';
        
        detailProductImg.style.transformOrigin = `${x}% ${y}%`;
        detailProductImg.style.transform = `scale(1.8) scaleX(${scaleXValue})`;
    });

    zoomImgContainer.addEventListener('mouseleave', () => {
        const isPose2 = detailProductImg.dataset.pose === '2';
        const scaleXValue = isPose2 ? '-1' : '1';
        
        detailProductImg.style.transformOrigin = 'center center';
        detailProductImg.style.transform = `scale(1) scaleX(${scaleXValue})`;
    });
}

// Render Related Products
function renderRelatedProducts() {
    relatedGrid.innerHTML = '';
    const products = db.getProducts();
    const related = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 3);

    if (related.length === 0) {
        const fallback = products.filter(p => p.id !== currentProduct.id).slice(0, 3);
        renderProductCards(fallback);
    } else {
        renderProductCards(related);
    }
}

function renderProductCards(items) {
    items.forEach(product => {
        const discountPercent = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);
        
        const stockBadgeHtml = product.stock <= 3 
            ? `<div class="stock-badge badge-warning">Tükenmek Üzere</div>`
            : `<div class="stock-badge badge-info">Stok: ${product.stock} Adet</div>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.position = 'relative';
        card.innerHTML = `
            <a href="product.html?id=${product.id}">
                <div class="product-img">
                    ${stockBadgeHtml}
                    <span class="discount-badge">%${discountPercent} İndirim</span>
                    <img src="${product.image}" alt="${product.title}">
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
                <button class="btn btn-primary w-100 add-to-cart-related" data-id="${product.id}" ${product.stock === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
                    ${product.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
                </button>
            </div>
        `;
        relatedGrid.appendChild(card);
    });

    // Related add to cart listeners
    document.querySelectorAll('.add-to-cart-related').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const products = db.getProducts();
            const prod = products.find(p => p.id === id);
            const defaultSize = prod.sizes[0];
            addToCart(id, defaultSize, 1, e.currentTarget);
        });
    });
}

// Cart Sync
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
                <img src="${item.image}" alt="${item.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px;">
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
                const id = parseInt(e.currentTarget.dataset.id);
                const size = e.currentTarget.dataset.size;
                removeFromCart(id, size);
            });
        });
    }

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

// Modals Toggling
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

function openCheckoutModal() {
    closeCart();
    
    // Auto fill details if user logged in
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

// Toast
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
            <img src="${product.image}" alt="${product.title}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);">
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

// Render Reviews panel from DB

let visibleReviewCount = 5;

window.loadMoreReviews = function() {
    visibleReviewCount += 5;
    renderReviews();
};

function renderReviews() {
    reviewsList.innerHTML = '';
    const reviews = db.getReviews(currentProduct.id);
    const stats = db.getReviewsStats(currentProduct.id);
    
    const avgRatingVal = document.getElementById('avg-rating-value');
    const avgRatingStars = document.getElementById('avg-rating-stars');
    const totalReviewsCount = document.getElementById('total-reviews-count');
    const starsDistributionBars = document.getElementById('stars-distribution-bars');
    
    if (reviewsCountTab) reviewsCountTab.innerText = stats.totalCount;

    if (avgRatingVal) avgRatingVal.innerText = stats.average.toFixed(1);
    if (avgRatingStars) {
        avgRatingStars.innerHTML = '<i class="fa-solid fa-star"></i>'.repeat(4) + 
                                   '<i class="fa-solid fa-star-half-stroke" style="color: #FFD700; text-shadow: 0 0 4px rgba(255, 215, 0, 0.8), 0 0 10px rgba(255, 215, 0, 0.4);"></i>';
    }
    if (totalReviewsCount) totalReviewsCount.innerText = `${stats.totalCount} değerlendirme`;
    
    if (starsDistributionBars) {
        starsDistributionBars.innerHTML = [5, 4, 3, 2, 1].map(stars => {
            const count = stats.distribution[stars];
            const percent = ((count / stats.totalCount) * 100).toFixed(0);
            return `
                <div class="rating-bar-row">
                    <div class="rating-bar-stars">${stars} Yıldız <i class="fa-solid fa-star"></i></div>
                    <div class="rating-bar-track">
                        <div class="rating-bar-fill" style="width: ${percent}%;"></div>
                    </div>
                    <div class="rating-bar-count">${count}</div>
                </div>
            `;
        }).join('');
    }
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="color: gray; font-size: 0.9rem; text-align: center; margin-top: 15px;">Henüz yazılı yorum yapılmamış.</p>';
        return;
    }
    
    const visibleReviews = reviews.slice(0, visibleReviewCount);
    
    visibleReviews.forEach(review => {
        const item = document.createElement('div');
        item.className = 'review-item';
        
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHtml += '<i class="fa-solid fa-star"></i>';
            } else {
                starsHtml += '<i class="fa-regular fa-star" style="color: #ccc;"></i>';
            }
        }
        
        let adminReplyHtml = '';
        if (review.adminReply) {
            adminReplyHtml = `
            <div style="margin-top: 15px; padding: 12px 15px; background: rgba(197, 161, 96, 0.08); border-left: 3px solid var(--primary); border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    <i class="fa-solid fa-headset" style="color: var(--primary);"></i>
                    <strong style="font-size: 0.85rem; color: var(--dark);">Dora Elektronik Müşteri Hizmetleri</strong>
                </div>
                <p style="margin: 0; font-size: 0.85rem; color: var(--gray); line-height: 1.4;">${sanitizeInput(review.adminReply)}</p>
            </div>`;
        }
        
        item.innerHTML = `
            <div class="review-header">
                <span class="review-author">${sanitizeInput(review.author)}</span>
                <span class="review-date">${review.date}</span>
            </div>
            <div class="review-stars">
                ${starsHtml}
            </div>
            <p class="review-text">${sanitizeInput(review.text)}</p>
            ${adminReplyHtml}
        `;
        reviewsList.appendChild(item);
    });
    
    if (visibleReviewCount < reviews.length) {
        const btnContainer = document.createElement('div');
        btnContainer.style.textAlign = 'center';
        btnContainer.style.marginTop = '20px';
        btnContainer.innerHTML = `<button onclick="window.loadMoreReviews()" class="btn btn-secondary" style="padding: 8px 25px; border-radius: 25px; font-size: 0.85rem;"><i class="fa-solid fa-chevron-down" style="margin-right: 5px;"></i> Daha Fazla Göster</button>`;
        reviewsList.appendChild(btnContainer);
    }
}

// Interacting with stars input in reviews form
function setupRatingStarsInput() {
    const stars = ratingStarsInput.querySelectorAll('.star-select');
    updateStarsUI(selectedRating);
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            updateStarsUI(selectedRating);
        });
    });
    
    function updateStarsUI(rating) {
        stars.forEach(s => {
            const val = parseInt(s.dataset.value);
            if (val <= rating) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }
}

// General listeners
function setupEventListeners() {
    // Cart sidebar toggle listeners
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Auth Modal click and overlay handlers
    closeLoginBtn.addEventListener('click', closeLoginModal);
    loginOverlay.addEventListener('click', closeLoginModal);
    closeRegisterBtn.addEventListener('click', closeRegisterModal);
    registerOverlay.addEventListener('click', closeRegisterModal);

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

        if (pIsRateLimited('loginForm', 1500)) return;

        const lockSecs = pIsLoginLocked();
        if (lockSecs > 0) {
            loginErrorMsg.textContent = `Çok fazla başarısız deneme. Lütfen ${lockSecs} saniye bekleyin.`;
            loginErrorMsg.style.display = 'block';
            return;
        }

        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        if (!email || !email.includes('@') || !pass) {
            loginErrorMsg.textContent = 'Lütfen geçerli e-posta ve şifre giriniz.';
            loginErrorMsg.style.display = 'block';
            return;
        }

        try {
            await db.login(email, pass);
            pResetLoginAttempts();
            closeLoginModal();
            renderAuthNavbar();
            showToast('Giriş başarılı!');
        } catch (err) {
            pRecordLoginFailure();
            const lockSecsNow = pIsLoginLocked();
            if (lockSecsNow > 0) {
                loginErrorMsg.textContent = `5 başarısız deneme! ${lockSecsNow} saniye beklemeniz gerekmektedir.`;
            } else {
                loginErrorMsg.textContent = err.message + ` (${5 - _pLoginAttempts.count} deneme hakkınız kaldı)`;
            }
            loginErrorMsg.style.display = 'block';
        }
    });

    // Register submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (pIsRateLimited('registerForm', 2000)) return;

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const addr = document.getElementById('register-address').value.trim();
        const pass = document.getElementById('register-password').value;

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

    // Add to cart checkout trigger
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            openCheckoutModal();
        }
    });

    // Checkout steps
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

    // Payment Confirm -> Triggers 3D secure SMS modal
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

    // 3D Secure Verification Submit Form
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

                activeCoupon = null;
                couponInput.value = '';
                couponMessage.innerText = '';

                cart = [];
                updateCart();

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
            renderProductDetails();
        }
    });
    successOverlay.addEventListener('click', () => {
        successModal.classList.remove('active');
        successOverlay.classList.remove('active');
    });

    // Search enter redirection
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `index.html?search=${encodeURIComponent(query)}`;
            }
        }
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

    // About/Contact modals
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

    // Size Guide Modal opening / closing
    const sizeGuideModal = document.getElementById('size-guide-modal');
    const sizeGuideOverlay = document.getElementById('size-guide-overlay');
    const closeSizeGuideBtn = document.getElementById('close-size-guide');
    const sizeGuideLinkEl = document.getElementById('size-guide-link');

    const openSizeGuideModal = (e) => {
        if (e) e.preventDefault();
        if (sizeGuideModal && sizeGuideOverlay) {
            sizeGuideModal.classList.add('active');
            sizeGuideOverlay.classList.add('active');
        }
    };

    const closeSizeGuideModal = () => {
        if (sizeGuideModal && sizeGuideOverlay) {
            sizeGuideModal.classList.remove('active');
            sizeGuideOverlay.classList.remove('active');
        }
    };

    if (sizeGuideLinkEl) sizeGuideLinkEl.addEventListener('click', openSizeGuideModal);
    if (closeSizeGuideBtn) closeSizeGuideBtn.addEventListener('click', closeSizeGuideModal);
    if (sizeGuideOverlay) sizeGuideOverlay.addEventListener('click', closeSizeGuideModal);

    // Review Form Submit
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const authorInput = document.getElementById('review-author');
        const textInput = document.getElementById('review-text');
        
        const author = authorInput.value.trim();
        const text = textInput.value.trim();
        
        if (!author || !text) return;
        
        db.addReview(currentProduct.id, author, selectedRating, text);
        
        renderReviews();
        reviewForm.reset();
        selectedRating = 5;
        setupRatingStarsInput();
        
        showToast('Yorumunuz başarıyla gönderildi!');
    });
}

// Tab Switcher
function setupTabListeners() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetTab = tab.dataset.tab;
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.add('hidden');
            });
            document.getElementById(`tab-${targetTab}`).classList.remove('hidden');
        });
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
        // Reload details page to update stocks in UI!
        if (typeof renderProductDetails === 'function') {
            renderProductDetails();
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
            if (currentProduct) {
                db.addReview(currentProduct.id, name, score, comment);
            }
            showToast("Değerlendirmeniz için teşekkür ederiz!");
        }
        closeAll();
        // Reload reviews to see new rating
        if (typeof renderReviews === 'function') {
            renderReviews();
        }
    };
}

// Setup Page
if (db.initPromise) {
    db.initPromise.then(() => initDetailPage());
} else {
    initDetailPage();
}
