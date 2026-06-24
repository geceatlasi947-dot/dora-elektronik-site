// Profile Page Interactivity - Dora Elektronik
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
// ─────────────────────────────────────────────────────────────────────────

// Check authentication (will be loaded on initProfile after db.init resolves)
let currentUser = null;

// State
let cart = [];
try {
    const rawCart = localStorage.getItem('dora_cart');
    if (rawCart) cart = JSON.parse(rawCart);
} catch (e) {
    cart = [];
}
let activeCoupon = null;

// DOM Elements
const authArea = document.getElementById('auth-area');
const searchInput = document.getElementById('search-input');
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
const aboutModal = document.getElementById('about-modal');
const aboutOverlay = document.getElementById('about-overlay');
const closeAboutBtn = document.getElementById('close-about');
const contactModal = document.getElementById('contact-modal');
const contactOverlay = document.getElementById('contact-overlay');
const closeContactBtn = document.getElementById('close-contact');
const contactForm = document.getElementById('contact-form');
const footerAboutLink = document.getElementById('footer-about-link');
const footerContactLink = document.getElementById('footer-contact-link');

// Profile Page Specific Elements
const avatarLetters = document.getElementById('avatar-letters');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserEmail = document.getElementById('sidebar-user-email');
const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');

const tabBtns = document.querySelectorAll('.profile-tab-btn');
const panes = document.querySelectorAll('.profile-pane');

const profileInfoForm = document.getElementById('profile-info-form');
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');
const profilePhoneInput = document.getElementById('profile-phone');

const profileAddressForm = document.getElementById('profile-address-form');
const profileAddressInput = document.getElementById('profile-address');

const ordersListContainer = document.getElementById('orders-list-container');

// Initialize Profile Page
function initProfile() {
    currentUser = db.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // 1. Render User profile details
    const names = currentUser.name.split(' ');
    const initials = names.map(n => n.charAt(0).toUpperCase()).slice(0, 2).join('');
    avatarLetters.innerText = sanitizeInput(initials) || 'U';
    
    sidebarUserName.innerText = sanitizeInput(currentUser.name);
    sidebarUserEmail.innerText = sanitizeInput(currentUser.email);

    // Fill form fields
    profileNameInput.value = sanitizeInput(currentUser.name);
    profileEmailInput.value = sanitizeInput(currentUser.email);
    profilePhoneInput.value = sanitizeInput(currentUser.phone) || '';
    profileAddressInput.value = sanitizeInput(currentUser.address) || '';

    // Render orders
    renderUserOrders();

    // Render Auth Navbar Area
    renderAuthNavbar();

    // Sync Cart
    updateCart();

    // Setup general listeners
    setupProfileListeners();
    setupCartListeners();
}

// Render Header Authentication Area
function renderAuthNavbar() {
    authArea.innerHTML = '';
    
    // Logged in
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '10px';
    wrapper.innerHTML = `
        <span style="font-size:0.85rem; font-weight: 500; color:var(--dark); cursor:pointer;" onclick="window.location.href='profile.html'">
            <i class="fa-regular fa-circle-user" style="margin-right:4px;"></i> ${sanitizeInput(currentUser.name)}
        </span>
        ${currentUser.role === 'admin' ? `
            <a href="admin.html" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 20px; border-color: var(--primary); color: var(--primary);">Panel</a>
        ` : ''}
        <button id="logout-nav-btn" class="icon-btn" style="font-size: 1rem; color: #ff4757;" title="Çıkış Yap">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
    `;
    authArea.appendChild(wrapper);

    // Logout nav listener
    document.getElementById('logout-nav-btn').addEventListener('click', () => {
        db.logout();
        window.location.href = 'index.html';
    });
}

// Render Orders List
function renderUserOrders() {
    const orders = db.getUserOrders(currentUser.id);
    
    // Sort orders from newest to oldest
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (orders.length === 0) {
        ordersListContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray);">
                <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 15px; color: #ccc;"></i>
                <p>Kayıtlı herhangi bir siparişiniz bulunmamaktadır.</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 15px; padding: 8px 20px; font-size: 0.85rem;">Alışverişe Başla</a>
            </div>
        `;
        return;
    }

    ordersListContainer.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.style.border = '1px solid var(--border)';
        orderCard.style.borderRadius = '6px';
        orderCard.style.padding = '20px';
        orderCard.style.marginBottom = '20px';
        orderCard.style.background = '#fdfcfc';
        
        // Define tracking steps classes
        const status = order.status; // Hazırlanıyor, Kargoda, Teslim Edildi, İptal Edildi
        
        let step1 = 'active';
        let step2 = '';
        let step3 = '';
        
        if (status === 'Kargoda') {
            step2 = 'active';
        } else if (status === 'Teslim Edildi') {
            step2 = 'active';
            step3 = 'active';
        } else if (status === 'İptal Edildi') {
            step1 = 'cancelled';
        }

        const orderDate = new Date(order.created_at).toLocaleDateString('tr-TR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; padding:8px 0; border-bottom:1px dashed #f0eeeb;">
                    <div>
                        <strong style="color:var(--dark);">${item.brand}</strong> - ${item.title} 
                        <span style="font-size:0.75rem; color:var(--gray); background:#f0ede7; padding:2px 6px; border-radius:3px; margin-left:5px;">Seçim: ${item.size}</span>
                    </div>
                    <div>${item.price.toLocaleString('tr-TR')} TL x ${item.quantity}</div>
                </div>
            `;
        });

        orderCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom: 15px;">
                <div>
                    <span style="font-weight:700; color:var(--primary);">${order.order_code}</span>
                    <span style="color:var(--gray); font-size:0.8rem; margin-left:10px;">${orderDate}</span>
                </div>
                <div>
                    <span style="font-size:0.85rem; color:var(--gray);">Toplam Tutar:</span>
                    <strong style="font-size:1.1rem; color:var(--dark);">${order.total.toLocaleString('tr-TR')} TL</strong>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                ${itemsHtml}
            </div>

            <!-- Tracking Status Progress Bar -->
            ${status === 'İptal Edildi' ? `
                <div style="display:flex; align-items:center; gap:10px; color:#ff4757; font-weight:600; font-size:0.9rem;">
                    <i class="fa-solid fa-circle-xmark"></i> Bu sipariş iptal edilmiştir.
                </div>
            ` : `
                <div class="tracking-progressbar" style="display:flex; justify-content:space-between; margin-top:20px; position:relative; padding: 10px 0;">
                    <div class="tracking-line" style="position:absolute; top:18px; left:10%; right:10%; height:3px; background:#e0dcd3; z-index:1;">
                        <div class="tracking-line-progress" style="height:100%; background:var(--primary); transition: width 0.4s; width: ${status === 'Hazırlanıyor' ? '0%' : status === 'Kargoda' ? '50%' : '100%'};"></div>
                    </div>
                    
                    <div class="tracking-step ${step1}" style="z-index:2; text-align:center; flex:1;">
                        <span class="step-bullet" style="width:20px; height:20px; border-radius:50%; background:${step1 ? 'var(--primary)' : '#ccc'}; color:white; display:inline-flex; align-items:center; justify-content:center; font-size:0.65rem; margin-bottom:5px;"><i class="fa-solid fa-check"></i></span>
                        <div style="font-size:0.75rem; font-weight:500;">Hazırlanıyor</div>
                    </div>
                    <div class="tracking-step ${step2}" style="z-index:2; text-align:center; flex:1;">
                        <span class="step-bullet" style="width:20px; height:20px; border-radius:50%; background:${step2 ? 'var(--primary)' : '#ccc'}; color:white; display:inline-flex; align-items:center; justify-content:center; font-size:0.65rem; margin-bottom:5px;">2</span>
                        <div style="font-size:0.75rem; font-weight:500;">Kargoda</div>
                    </div>
                    <div class="tracking-step ${step3}" style="z-index:2; text-align:center; flex:1;">
                        <span class="step-bullet" style="width:20px; height:20px; border-radius:50%; background:${step3 ? 'var(--primary)' : '#ccc'}; color:white; display:inline-flex; align-items:center; justify-content:center; font-size:0.65rem; margin-bottom:5px;">3</span>
                        <div style="font-size:0.75rem; font-weight:500;">Teslim Edildi</div>
                    </div>
                </div>
            `}
        `;
        ordersListContainer.appendChild(orderCard);
    });
}

// Toast Notification
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

// Setup Profile Page Listeners
function setupProfileListeners() {
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = 'var(--gray)';
            });
            btn.classList.add('active');
            btn.style.color = 'var(--dark)';

            const targetTab = btn.dataset.tab;
            panes.forEach(pane => pane.classList.add('hidden'));
            document.getElementById(`pane-${targetTab}`).classList.remove('hidden');
        });
    });

    // Profile info submit
    profileInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedName = profileNameInput.value.trim();
        const updatedPhone = profilePhoneInput.value.trim();
        const updatedAddress = profileAddressInput.value.trim();

        try {
            db.updateUserProfile(currentUser.id, updatedName, updatedPhone, updatedAddress);
            sidebarUserName.innerText = updatedName;
            
            // Refresh initials
            const names = updatedName.split(' ');
            avatarLetters.innerText = names.map(n => n.charAt(0).toUpperCase()).slice(0, 2).join('');
            
            showToast('Üyelik bilgileriniz başarıyla güncellendi!');
        } catch (err) {
            alert(err.message);
        }
    });

    // Profile address submit
    profileAddressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedAddress = profileAddressInput.value.trim();
        
        try {
            db.updateUserProfile(currentUser.id, currentUser.name, currentUser.phone, updatedAddress);
            showToast('Teslimat adresiniz başarıyla kaydedildi!');
        } catch (err) {
            alert(err.message);
        }
    });

    // Logout
    sidebarLogoutBtn.addEventListener('click', () => {
        db.logout();
        window.location.href = 'index.html';
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
}

// Cart Sync Functions (Same as app.js / product.js)
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

function setupCartListeners() {
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            closeCart();
            window.location.href = 'index.html?checkout=true';
        });
    }

    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', () => {
            const couponInput = document.getElementById('coupon-input');
            const couponMessage = document.getElementById('coupon-message');
            if (!couponInput || !couponMessage) return;
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
    }
}

// Run on load
if (db.initPromise) {
    db.initPromise.then(() => initProfile());
} else {
    initProfile();
}

