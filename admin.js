// Admin Panel Script - Dora Elektronik
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

// Admin authentication verification (will be checked in initAdmin)
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
let categoryChartInstance = null;
let orderStatusChartInstance = null;

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

// Admin Elements
const tabBtns = document.querySelectorAll('.admin-tab-btn');
const panes = document.querySelectorAll('.admin-pane');

const statRevenue = document.getElementById('stat-revenue');
const statOrders = document.getElementById('stat-orders');
const statUsers = document.getElementById('stat-users');
const statLowstock = document.getElementById('stat-lowstock');

const adminOrdersRows = document.getElementById('admin-orders-rows');

const toggleAddProductBtn = document.getElementById('toggle-add-product-btn');
const addProductPanel = document.getElementById('add-product-panel');
const addProductForm = document.getElementById('add-product-form');
const adminInventoryRows = document.getElementById('admin-inventory-rows');

const adminReviewsRows = document.getElementById('admin-reviews-rows');

// Payment Panel DOM Elements
const unlockPaymentsBtn = document.getElementById('unlock-payments-btn');
const lockPaymentsBtn = document.getElementById('lock-payments-btn');
const paymentUnlockContainer = document.getElementById('payment-unlock-container');
const paymentRecordsContainer = document.getElementById('payment-records-container');
const paymentAdminPassword = document.getElementById('payment-admin-password');
const adminPaymentsRows = document.getElementById('admin-payments-rows');
const paymentLockIcon = document.getElementById('payment-lock-icon');

let decryptedPayments = [];

// Coupons Panel DOM Elements
const toggleAddCouponBtn = document.getElementById('toggle-add-coupon-btn');
const addCouponPanel = document.getElementById('add-coupon-panel');
const addCouponForm = document.getElementById('add-coupon-form');
const adminCouponsRows = document.getElementById('admin-coupons-rows');

// Initialize Admin Dashboard
function initAdmin() {
    currentUser = db.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html?login=admin';
        return;
    }
    renderAuthNavbar();
    updateCart();
    loadDashboardStats();
    renderOrdersTable();
    renderInventoryTable();
    renderReviewsTable();
    renderCouponsTable();
    setupAdminListeners();
    setupCartListeners();
    setupPaymentListeners();
    setupCouponListeners();
}

// Render Authentication Area in Navbar
function renderAuthNavbar() {
    authArea.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '10px';
    wrapper.innerHTML = `
        <span style="font-size:0.85rem; font-weight: 500; color:var(--dark); cursor:pointer;" onclick="window.location.href='profile.html'">
            <i class="fa-regular fa-circle-user" style="margin-right:4px;"></i> ${currentUser.name} (Admin)
        </span>
        <button id="logout-nav-btn" class="icon-btn" style="font-size: 1rem; color: #ff4757;" title="Çıkış Yap">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
    `;
    authArea.appendChild(wrapper);

    document.getElementById('logout-nav-btn').addEventListener('click', () => {
        db.logout();
        window.location.href = 'index.html';
    });
}

// Toast Notification
function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 400);
    }, 3000);
}

// Load Stats and Render Charts
function loadDashboardStats() {
    const orders = db.getOrders();
    const products = db.getProducts();
    const users = db.getCollection('users');

    // Revenue (Sum of non-cancelled orders)
    const revenue = orders.filter(o => o.status !== 'İptal Edildi').reduce((sum, o) => sum + o.total, 0);
    statRevenue.innerText = `${revenue.toLocaleString('tr-TR')} TL`;
    
    // Total Orders
    statOrders.innerText = orders.length;

    // Total Customers
    const customerCount = users.filter(u => u.role === 'customer').length;
    statUsers.innerText = customerCount;

    // Low Stock (Stock <= 3)
    const lowStockCount = products.filter(p => p.stock <= 3).length;
    statLowstock.innerText = lowStockCount;

    // Render Charts
    renderCharts(products, orders);
}

// Render Chart.js Analytics
function renderCharts(products, orders) {
    // 1. Category Chart
    const categories = ['guzellik', 'temizlik', 'mutfak', 'kahve'];
    const categoryCounts = categories.map(cat => products.filter(p => p.category === cat).length);

    const ctxCategory = document.getElementById('categoryChart').getContext('2d');
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }
    categoryChartInstance = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
            labels: ['Güzellik', 'Temizlik', 'Mutfak', 'Kahve'],
            datasets: [{
                data: categoryCounts,
                backgroundColor: ['#c9a66b', '#1a1a1a', '#e0dcd3', '#888888'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 2. Order Status Chart
    const statuses = ['Hazırlanıyor', 'Kargoda', 'Teslim Edildi', 'İptal Edildi'];
    const statusCounts = statuses.map(stat => orders.filter(o => o.status === stat).length);

    const ctxStatus = document.getElementById('orderStatusChart').getContext('2d');
    if (orderStatusChartInstance) {
        orderStatusChartInstance.destroy();
    }
    orderStatusChartInstance = new Chart(ctxStatus, {
        type: 'pie',
        data: {
            labels: statuses,
            datasets: [{
                data: statusCounts,
                backgroundColor: ['#e0dcd3', '#17c0eb', '#2ed573', '#ff4757'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Render Orders Table
function renderOrdersTable() {
    const orders = db.getOrders();
    // Sort newest first
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (orders.length === 0) {
        adminOrdersRows.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--gray);">Henüz sipariş bulunmuyor.</td></tr>`;
        return;
    }

    adminOrdersRows.innerHTML = '';
    orders.forEach(order => {
        let itemsDesc = '';
        order.items.forEach(item => {
            itemsDesc += `<div>${item.brand} ${item.title} (${item.size}) x ${item.quantity}</div>`;
        });

        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border)';
        
        row.innerHTML = `
            <td style="padding: 12px; font-weight: 600; color: var(--primary);">${order.order_code}</td>
            <td style="padding: 12px;">
                <div style="font-weight: 500;">${order.contact_info.split('|')[0] || 'Misafir'}</div>
                <div style="font-size: 0.75rem; color: var(--gray);">${order.address}</div>
            </td>
            <td style="padding: 12px; font-size: 0.8rem;">${itemsDesc}</td>
            <td style="padding: 12px; text-align: right; font-weight: 600;">${order.total.toLocaleString('tr-TR')} TL</td>
            <td style="padding: 12px; text-align: center;">
                <select class="order-status-select" data-id="${order.id}" style="padding: 4px 8px; border-radius: 4px; font-family: inherit; font-size: 0.8rem; background: #fff; border: 1px solid var(--border);">
                    <option value="Hazırlanıyor" ${order.status === 'Hazırlanıyor' ? 'selected' : ''}>Hazırlanıyor</option>
                    <option value="Kargoda" ${order.status === 'Kargoda' ? 'selected' : ''}>Kargoda</option>
                    <option value="Teslim Edildi" ${order.status === 'Teslim Edildi' ? 'selected' : ''}>Teslim Edildi</option>
                    <option value="İptal Edildi" ${order.status === 'İptal Edildi' ? 'selected' : ''}>İptal Edildi</option>
                </select>
            </td>
            <td style="padding: 12px; text-align: center;">
                <button class="btn btn-secondary update-status-btn" data-id="${order.id}" style="padding: 4px 8px; font-size: 0.75rem;">Güncelle</button>
            </td>
        `;
        adminOrdersRows.appendChild(row);
    });

    // Add status update button listeners
    document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = parseInt(e.target.dataset.id);
            const select = document.querySelector(`select.order-status-select[data-id="${orderId}"]`);
            const newStatus = select.value;

            try {
                db.updateOrderStatus(orderId, newStatus);
                showToast(`Sipariş durumu "${newStatus}" olarak güncellendi!`);
                loadDashboardStats(); // Refresh stats/charts
                renderOrdersTable(); // Refresh table view
            } catch (err) {
                alert(err.message);
            }
        });
    });
}

// Render Inventory Table
function renderInventoryTable() {
    const products = db.getProducts();

    adminInventoryRows.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border)';
        
        row.innerHTML = `
            <td style="padding: 12px;"><img src="${product.image}" alt="${product.title}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
            <td style="padding: 12px;">
                <div style="font-weight:600;">${product.brand}</div>
                <div style="color:var(--gray); font-size:0.8rem;">${product.title}</div>
            </td>
            <td style="padding: 12px; text-transform: capitalize;">${product.category}</td>
            <td style="padding: 12px; text-align: right;">
                <input type="number" step="0.01" class="edit-price-input" data-id="${product.id}" value="${product.newPrice}" style="width: 80px; text-align: right; padding: 4px; border: 1px solid var(--border); border-radius: 4px;">
            </td>
            <td style="padding: 12px; text-align: center;">
                <input type="number" class="edit-stock-input" data-id="${product.id}" value="${product.stock}" style="width: 60px; text-align: center; padding: 4px; border: 1px solid var(--border); border-radius: 4px; background: ${product.stock <= 3 ? '#ffefef' : '#fff'}; color: ${product.stock <= 3 ? '#ff3838' : '#000'};">
            </td>
            <td style="padding: 12px; text-align: center;">
                <button class="btn btn-primary save-product-btn" data-id="${product.id}" style="padding: 4px 8px; font-size: 0.75rem; background:#2ed573; margin-right:4px;">Kaydet</button>
                <button class="btn btn-primary delete-product-btn" data-id="${product.id}" style="padding: 4px 8px; font-size: 0.75rem; background:#ff4757;">Sil</button>
            </td>
        `;
        adminInventoryRows.appendChild(row);
    });

    // Save inventory product details changes
    document.querySelectorAll('.save-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = parseInt(btn.dataset.id);
            const priceVal = parseFloat(document.querySelector(`.edit-price-input[data-id="${prodId}"]`).value);
            const stockVal = parseInt(document.querySelector(`.edit-stock-input[data-id="${prodId}"]`).value);

            if (isNaN(priceVal) || priceVal <= 0 || isNaN(stockVal) || stockVal < 0) {
                alert('Geçersiz fiyat veya stok değeri.');
                return;
            }

            const product = db.getProductById(prodId);
            if (product) {
                product.newPrice = priceVal;
                product.stock = stockVal;
                db.saveProduct(product);
                showToast('Ürün başarıyla güncellendi!');
                loadDashboardStats();
                renderInventoryTable();
            }
        });
    });

    // Delete product listeners
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = parseInt(btn.dataset.id);
            if (confirm('Bu ürünü envanterden silmek istediğinizden emin misiniz?')) {
                db.deleteProduct(prodId);
                showToast('Ürün envanterden kaldırıldı.');
                loadDashboardStats();
                renderInventoryTable();
            }
        });
    });
}

// Render Reviews Moderation Table
function renderReviewsTable() {
    const products = db.getProducts();
    adminReviewsRows.innerHTML = '';
    
    let hasReviews = false;

    products.forEach(product => {
        const reviews = db.getReviews(product.id);
        
        reviews.forEach((review, idx) => {
            hasReviews = true;
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border)';
            
            row.innerHTML = `
                <td style="padding: 12px; font-size: 0.8rem;">
                    <strong>${product.brand}</strong><br>${product.title}
                </td>
                <td style="padding: 12px;">${sanitizeInput(review.author)}</td>
                <td style="padding: 12px; text-align: center; color: #ffa502;">
                    ${review.rating} <i class="fa-solid fa-star" style="font-size: 0.75rem;"></i>
                </td>
                <td style="padding: 12px; font-size: 0.8rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${sanitizeInput(review.text)}">${sanitizeInput(review.text)}</td>
                <td style="padding: 12px; text-align: center; font-size: 0.8rem; color: var(--gray);">${review.date}</td>
                <td style="padding: 12px; text-align: center;">
                    <button class="btn btn-primary delete-review-btn" data-prod-id="${product.id}" data-review-idx="${idx}" style="padding: 4px 8px; font-size: 0.75rem; background:#ff4757;">Sil</button>
                </td>
            `;
            adminReviewsRows.appendChild(row);
        });
    });

    if (!hasReviews) {
        adminReviewsRows.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--gray);">Modere edilecek yorum bulunmuyor.</td></tr>`;
        return;
    }

    // Delete review listeners
    document.querySelectorAll('.delete-review-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = parseInt(btn.dataset.prodId);
            const reviewIdx = parseInt(btn.dataset.reviewIdx);

            if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
                db.deleteReview(prodId, reviewIdx);
                showToast('Yorum başarıyla silindi.');
                renderReviewsTable();
            }
        });
    });
}

// Setup Admin Panel Listeners
function setupAdminListeners() {
    // Hide all panes except dashboard on load
    panes.forEach(pane => {
        if (pane.id === 'pane-dashboard') {
            pane.classList.remove('hidden');
        } else {
            pane.classList.add('hidden');
        }
    });

    // Sidebar Tab Navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = btn.dataset.tab;
            
            // Update active button styling
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = 'var(--gray)';
            });
            btn.classList.add('active');
            btn.style.color = 'var(--dark)';

            // Toggle panes visibility
            panes.forEach(pane => {
                if (pane.id === `pane-${targetTab}`) {
                    pane.classList.remove('hidden');
                } else {
                    pane.classList.add('hidden');
                }
            });

            // Smooth scroll to top of content
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Add Product Form Toggle
    toggleAddProductBtn.addEventListener('click', () => {
        addProductPanel.classList.toggle('hidden');
        if (addProductPanel.classList.contains('hidden')) {
            toggleAddProductBtn.innerText = 'Yeni Ürün Ekle';
        } else {
            toggleAddProductBtn.innerText = 'Kapat';
        }
    });

    // Add Product Form Submit
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('new-prod-title').value.trim();
        const brand = document.getElementById('new-prod-brand').value.trim();
        const category = document.getElementById('new-prod-category').value;
        const image = document.getElementById('new-prod-image').value.trim();
        const oldPrice = parseFloat(document.getElementById('new-prod-oldprice').value);
        const newPrice = parseFloat(document.getElementById('new-prod-newprice').value);
        const stock = parseInt(document.getElementById('new-prod-stock').value);
        const sizesStr = document.getElementById('new-prod-sizes').value;
        const desc = document.getElementById('new-prod-desc').value.trim();

        const sizes = sizesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const products = db.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

        const newProduct = {
            id: newId,
            brand: brand,
            title: title,
            category: category,
            image: image,
            oldPrice: oldPrice,
            newPrice: newPrice,
            stock: stock,
            sizes: sizes.length > 0 ? sizes : ["Standart"],
            description: desc
        };

        db.saveProduct(newProduct);
        showToast('Yeni ürün başarıyla envantere eklendi!');
        addProductForm.reset();
        addProductPanel.classList.add('hidden');
        toggleAddProductBtn.innerText = 'Yeni Ürün Ekle';

        loadDashboardStats();
        renderInventoryTable();
    });

    // Search Redirect on enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `index.html?search=${encodeURIComponent(query)}`;
            }
        }
    });

    // Footer Modals
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

// Cart Sync Functions (Same as app.js / profile.js)
function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
}

function removeFromCart(id, size) {
    cart = cart.filter(item => !(item.id === id && item.size === size));
    updateCart();
}

function updateCart() {
    try { localStorage.setItem('dora_cart', JSON.stringify(cart)); } catch(e) {}
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:gray; margin-top:20px;">Sepetiniz boş.</p>';
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        cartItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
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
                            <button class="cart-qty-btn decrease-qty" data-id="${item.id}" data-size="${item.size}" style="width: 22px; height: 100%; border: none; background: none; cursor: pointer; font-size: 0.75rem; color: var(--dark); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-minus"></i></button>
                            <span style="width: 26px; text-align: center; font-size: 0.8rem; font-weight: 600; line-height: 26px; border-left: 1px solid var(--border); border-right: 1px solid var(--border);">${item.quantity}</span>
                            <button class="cart-qty-btn increase-qty" data-id="${item.id}" data-size="${item.size}" style="width: 22px; height: 100%; border: none; background: none; cursor: pointer; font-size: 0.75rem; color: var(--dark); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-plus"></i></button>
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
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    
    // Redirect checkoutBtn to index.html to finish checkout
    checkoutBtn.addEventListener('click', () => {
        closeCart();
        window.location.href = 'index.html?checkout=true';
    });

    // Apply Coupon
    document.getElementById('apply-coupon-btn').addEventListener('click', () => {
        const couponInput = document.getElementById('coupon-input');
        const couponMessage = document.getElementById('coupon-message');
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

// Setup Payment Listeners
function setupPaymentListeners() {
    if (unlockPaymentsBtn) {
        unlockPaymentsBtn.addEventListener('click', async () => {
            const password = paymentAdminPassword.value.trim();
            if (!password) {
                alert('Lütfen yönetici şifrenizi girin.');
                return;
            }

            try {
                // Call database to decrypt
                decryptedPayments = await db.getDecryptedPayments(password);
                
                // Success -> toggle containers
                paymentUnlockContainer.classList.add('hidden');
                paymentRecordsContainer.classList.remove('hidden');
                paymentLockIcon.className = 'fa-solid fa-lock-open';
                paymentLockIcon.style.color = '#2ed573';
                
                // Clear input
                paymentAdminPassword.value = '';
                
                // Save key to sessionStorage to survive page refreshes
                sessionStorage.setItem('dora_admin_payment_key', password);

                // Render table
                renderPaymentsTable();
                showToast('Ödeme kayıtları başarıyla çözüldü!');
            } catch (err) {
                alert(err.message);
                sessionStorage.removeItem('dora_admin_payment_key');
            }
        });
        
        // Trigger unlock on Enter keypress
        paymentAdminPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                unlockPaymentsBtn.click();
            }
        });
    }

    if (lockPaymentsBtn) {
        lockPaymentsBtn.addEventListener('click', () => {
            // Re-lock
            paymentUnlockContainer.classList.remove('hidden');
            paymentRecordsContainer.classList.add('hidden');
            paymentLockIcon.className = 'fa-solid fa-lock';
            paymentLockIcon.style.color = 'var(--primary)';
            adminPaymentsRows.innerHTML = '';
            decryptedPayments = [];
            
            // Clear sessionStorage
            sessionStorage.removeItem('dora_admin_payment_key');

            showToast('Ödeme kayıtları başarıyla kilitlendi.');
        });
    }

    // Auto-unlock on load if key is saved in sessionStorage
    const savedKey = sessionStorage.getItem('dora_admin_payment_key');
    if (savedKey) {
        paymentAdminPassword.value = savedKey;
        unlockPaymentsBtn.click();
    }
}

// Render Decrypted Payments Table
function renderPaymentsTable() {
    adminPaymentsRows.innerHTML = '';
    
    if (decryptedPayments.length === 0) {
        adminPaymentsRows.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px; color: var(--gray);">Kayıtlı ödeme işlemi bulunmuyor.</td></tr>`;
        return;
    }

    decryptedPayments.forEach(pay => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border)';
        
        const displayCardNum = pay.cardNumber;
        const last4Digits = displayCardNum.slice(-4);
        const maskedCardNum = `•••• •••• •••• ${last4Digits}`;
        const fullCardNumFormatted = displayCardNum.match(/.{1,4}/g)?.join(' ') || displayCardNum;

        const dateObj = new Date(pay.created_at);
        const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

        const orderInfo = db.getOrders().find(o => o.order_code === pay.order_code);
        const displayAmount = pay.amount ? pay.amount : (orderInfo ? orderInfo.total : 0);

        row.innerHTML = `
            <td style="padding: 12px;">
                <div style="font-weight: 600; color: var(--primary);">${pay.enteredCode || 'SMS: Doğrulandı'}</div>
                <div style="font-size: 0.75rem; color: var(--gray);">${pay.order_code}</div>
            </td>
            <td style="padding: 12px; font-weight: 500;">${pay.cardName}</td>
            <td style="padding: 12px; font-family: monospace; font-size: 0.95rem;">
                <span class="card-num-text" data-full="${fullCardNumFormatted}" data-masked="${maskedCardNum}">${maskedCardNum}</span>
                <button class="toggle-card-visibility-btn" style="background: none; border: none; cursor: pointer; color: var(--primary); padding-left: 8px;" title="Göster/Gizle">
                    <i class="fa-regular fa-eye"></i>
                </button>
            </td>
            <td style="padding: 12px; text-align: center; font-family: monospace;">${pay.cardExpiry}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace;">
                <span class="cvc-text" data-full="${pay.cardCvc}" data-masked="•••">•••</span>
                <button class="toggle-cvc-visibility-btn" style="background: none; border: none; cursor: pointer; color: var(--primary); padding-left: 8px;" title="Göster/Gizle">
                    <i class="fa-regular fa-eye"></i>
                </button>
            </td>
            <td style="padding: 12px; text-align: center; font-size: 0.85rem; font-family: monospace;">
                <span style="color: var(--gray);">${pay.smsCode || 'SMS İletildi'}</span> / <strong style="color: var(--dark);">${pay.enteredCode || 'Sistem Onayı'}</strong>
            </td>
            <td style="padding: 12px; text-align: right; font-weight: 600;">${Number(displayAmount).toLocaleString('tr-TR')} TL</td>
            <td style="padding: 12px; text-align: center; font-size: 0.8rem; color: var(--gray);">${dateStr}</td>
        `;

        adminPaymentsRows.appendChild(row);
    });

    // Add Visibility Toggle Listeners
    adminPaymentsRows.querySelectorAll('.toggle-card-visibility-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnEl = e.currentTarget;
            const spanEl = btnEl.previousElementSibling;
            const iconEl = btnEl.querySelector('i');
            
            if (spanEl.innerText === spanEl.dataset.masked) {
                spanEl.innerText = spanEl.dataset.full;
                iconEl.className = 'fa-regular fa-eye-slash';
            } else {
                spanEl.innerText = spanEl.dataset.masked;
                iconEl.className = 'fa-regular fa-eye';
            }
        });
    });

    adminPaymentsRows.querySelectorAll('.toggle-cvc-visibility-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnEl = e.currentTarget;
            const spanEl = btnEl.previousElementSibling;
            const iconEl = btnEl.querySelector('i');
            
            if (spanEl.innerText === spanEl.dataset.masked) {
                spanEl.innerText = spanEl.dataset.full;
                iconEl.className = 'fa-regular fa-eye-slash';
            } else {
                spanEl.innerText = spanEl.dataset.masked;
                iconEl.className = 'fa-regular fa-eye';
            }
        });
    });
}

// Synthesize a pleasant notification sound using AudioContext (repeating for 5 seconds)
function playNotificationSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Play a doorbell/buzzer sound "zırrrrr . zırrrrr"
        let startTime = audioCtx.currentTime;
        
        function playBuzzer(time, duration) {
            let osc1 = audioCtx.createOscillator();
            let osc2 = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            
            // Low frequencies with a slight difference create a "buzzing" / beating effect
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(65.0, time);
            
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(67.0, time);
            
            // Envelope: sharp attack, sustain, sharp release
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.5, time + 0.05);
            gain.gain.setValueAtTime(0.5, time + duration - 0.05);
            gain.gain.linearRampToValueAtTime(0, time + duration);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc1.start(time);
            osc1.stop(time + duration);
            
            osc2.start(time);
            osc2.stop(time + duration);
        }

        // First ring: 1.5 seconds
        playBuzzer(startTime, 1.5);
        
        // Second ring: 1.5 seconds, starting 2.0 seconds after the first one
        playBuzzer(startTime + 2.0, 1.5);
        
    } catch (err) {
        console.error("Audio playback error:", err);
    }
}

// Storage listener to capture new data in real-time
window.addEventListener('storage', async (e) => {
    if (e.key === 'dora_db_payments' || e.key === 'dora_db_orders') {
        // Reload dashboard stats and order tables in real-time
        loadDashboardStats();
        renderOrdersTable();
        
        const savedKey = sessionStorage.getItem('dora_admin_payment_key');
        if (paymentRecordsContainer && !paymentRecordsContainer.classList.contains('hidden') && savedKey) {
            try {
                decryptedPayments = await db.getDecryptedPayments(savedKey);
                renderPaymentsTable();
                showToast('Yeni sipariş ve ödeme kaydı alındı, liste otomatik güncellendi!');
            } catch (err) {
                console.error("Auto-decrypt failed:", err);
                showToast('Yeni sipariş kaydı alındı!');
            }
        } else {
            showToast('Yeni sipariş ve ödeme kaydı alındı!');
        }
        
        // Play notification sound
        playNotificationSound();
    }
    
    if (e.key === 'dora_db_reviews') {
        renderReviewsTable();
        showToast('Yorumlar güncellendi.');
    }
    
    if (e.key === 'dora_db_products') {
        loadDashboardStats();
        renderInventoryTable();
    }
});
// Render Coupons Table
function renderCouponsTable() {
    const coupons = db.cache.coupons || [];

    adminCouponsRows.innerHTML = '';
    if (coupons.length === 0) {
        adminCouponsRows.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--gray);">Henüz kupon kodu bulunmuyor.</td></tr>`;
        return;
    }

    coupons.forEach(coupon => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border)';
        
        row.innerHTML = `
            <td style="padding: 12px; font-weight: 600; color: var(--primary);">${coupon.code}</td>
            <td style="padding: 12px; text-align: right; font-weight: 600;">%${coupon.discountPercent}</td>
            <td style="padding: 12px; text-align: center;">
                <button class="btn toggle-coupon-btn" data-code="${coupon.code}" style="padding: 4px 8px; font-size: 0.75rem; border: none; border-radius: 4px; color: white; background: ${coupon.active ? '#2ed573' : '#a8a8a8'}; cursor: pointer; min-width: 80px;">
                    ${coupon.active ? 'Aktif' : 'Pasif'}
                </button>
            </td>
            <td style="padding: 12px; text-align: center;">
                <button class="btn delete-coupon-btn" data-code="${coupon.code}" style="padding: 4px 8px; font-size: 0.75rem; border: none; border-radius: 4px; color: white; background: #ff4757; cursor: pointer;">
                    Sil
                </button>
            </td>
        `;
        adminCouponsRows.appendChild(row);
    });

    // Toggle coupon status
    document.querySelectorAll('#admin-coupons-rows .toggle-coupon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const code = btn.getAttribute('data-code');
            const couponsList = db.cache.coupons || [];
            const coupon = couponsList.find(c => c.code === code);
            if (coupon) {
                coupon.active = !coupon.active;
                db.saveCoupon(coupon);
                showToast(`"${code}" kuponu ${coupon.active ? 'aktifleştirildi' : 'deaktive edildi'}.`);
                renderCouponsTable();
            }
        });
    });

    // Delete coupon
    document.querySelectorAll('#admin-coupons-rows .delete-coupon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const code = btn.getAttribute('data-code');
            if (confirm(`"${code}" kupon kodunu silmek istediğinizden emin misiniz?`)) {
                db.deleteCoupon(code);
                showToast('Kupon kodu silindi.');
                renderCouponsTable();
            }
        });
    });
}

// Setup Coupon Listeners
function setupCouponListeners() {
    // Add Coupon Form Toggle
    toggleAddCouponBtn.addEventListener('click', () => {
        addCouponPanel.classList.toggle('hidden');
        if (addCouponPanel.classList.contains('hidden')) {
            toggleAddCouponBtn.innerText = 'Yeni Kupon Ekle';
        } else {
            toggleAddCouponBtn.innerText = 'Kapat';
        }
    });

    // Add Coupon Form Submit
    addCouponForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const codeInput = document.getElementById('new-coupon-code');
        const discountInput = document.getElementById('new-coupon-discount');
        const activeInput = document.getElementById('new-coupon-active');

        const codeVal = codeInput.value.trim().toUpperCase();
        const discountVal = parseInt(discountInput.value, 10);
        const activeVal = activeInput.checked;

        if (!codeVal) {
            alert('Lütfen kupon kodu giriniz.');
            return;
        }

        if (isNaN(discountVal) || discountVal < 1 || discountVal > 100) {
            alert('Lütfen %1 ile %100 arasında geçerli bir indirim oranı girin.');
            return;
        }

        const couponsList = db.cache.coupons || [];
        if (couponsList.some(c => c.code === codeVal)) {
            alert('Bu kupon kodu zaten mevcut.');
            return;
        }

        const newCoupon = {
            code: codeVal,
            discountPercent: discountVal,
            active: activeVal
        };

        db.saveCoupon(newCoupon);
        showToast('Kupon kodu başarıyla eklendi!');
        addCouponForm.reset();
        addCouponPanel.classList.add('hidden');
        toggleAddCouponBtn.innerText = 'Yeni Kupon Ekle';

        renderCouponsTable();
    });
}

// Run on load
if (db.initPromise) {
    db.initPromise.then(() => initAdmin());
} else {
    initAdmin();
}
