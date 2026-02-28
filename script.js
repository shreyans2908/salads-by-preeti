// ===== Salad Data =====
const salads = [
    {
        id: 1,
        name: 'Rainbow Garden Bowl',
        price: 349,
        badge: 'Bestseller',
        description: 'A vibrant medley of bell peppers, fresh greens, tofu, couscous, and our signature herb pesto dip. A feast for your eyes and soul.',
        calories: '320 cal',
        time: '10 min',
        serves: '1 person',
        image: 'images/salad-1.jpg',
        ingredients: ['Red Bell Pepper', 'Yellow Bell Pepper', 'Green Bell Pepper', 'Tofu', 'Couscous', 'Lettuce', 'Herb Pesto', 'Sesame Seeds', 'Peanuts']
    },
    {
        id: 2,
        name: 'Green Goddess Bowl',
        price: 299,
        badge: 'New',
        description: 'Fresh avocado, green peas, spinach, buckwheat, cherry tomatoes, and a tangy berry vinaigrette. Pure green goodness.',
        calories: '280 cal',
        time: '8 min',
        serves: '1 person',
        image: 'images/salad-2.jpeg',
        ingredients: ['Avocado', 'Green Peas', 'Spinach', 'Buckwheat', 'Cherry Tomatoes', 'Green Beans', 'Berry Vinaigrette']
    },
    {
        id: 3,
        name: 'Protein Power Bowl',
        price: 329,
        badge: 'Vegan',
        description: 'Hearty lentils, chickpeas, pomegranate seeds, cucumber, and mixed greens with pesto dressing. Protein-packed perfection.',
        calories: '350 cal',
        time: '12 min',
        serves: '1 person',
        image: 'images/salad-3.jpeg',
        ingredients: ['Lentils', 'Chickpeas', 'Pomegranate', 'Cucumber', 'Red Lettuce', 'Green Peas', 'Pesto Dressing']
    }
];

// ===== Cart State =====
let cart = [];
let currentModalSalad = null;

// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const cartOverlay = document.getElementById('cart-overlay');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsEl = document.getElementById('cart-items');
const cartEmptyEl = document.getElementById('cart-empty');
const cartFooterEl = document.getElementById('cart-footer');
const cartTotalEl = document.getElementById('cart-total-price');
const cartCountEl = document.getElementById('cart-count');
const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('product-modal');

// ===== Navbar Scroll =====
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Scroll Animations =====
const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.salad-card, .feature-card, .testimonial-card').forEach(el => {
    observer.observe(el);
});

// ===== Smooth Scroll for Anchors =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Cart Functions =====
function addToCart(saladId) {
    const salad = salads.find(s => s.id === saladId);
    const existing = cart.find(item => item.id === saladId);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...salad, qty: 1 });
    }

    // Button animation
    const btn = document.getElementById(`add-btn-${saladId}`);
    btn.classList.add('added');
    btn.querySelector('.btn-text').textContent = 'Added!';
    setTimeout(() => {
        btn.classList.remove('added');
        btn.querySelector('.btn-text').textContent = 'Add to Cart';
    }, 1200);

    updateCart();
    bumpCartCount();
}

function removeFromCart(saladId) {
    cart = cart.filter(item => item.id !== saladId);
    updateCart();
}

function changeQty(saladId, delta) {
    const item = cart.find(i => i.id === saladId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(saladId);
    } else {
        updateCart();
    }
}

function updateCart() {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    cartCountEl.textContent = totalQty;
    cartTotalEl.textContent = `₹${total}`;

    if (cart.length === 0) {
        cartEmptyEl.style.display = 'flex';
        cartFooterEl.style.display = 'none';
        cartItemsEl.innerHTML = '';
        cartItemsEl.appendChild(cartEmptyEl);
    } else {
        cartEmptyEl.style.display = 'none';
        cartFooterEl.style.display = 'block';
        renderCartItems();
    }
}

function renderCartItems() {
    const emptyEl = cartEmptyEl;
    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(emptyEl);

    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price * item.qty}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
        cartItemsEl.appendChild(div);
    });
}

function bumpCartCount() {
    cartCountEl.classList.remove('bump');
    void cartCountEl.offsetWidth; // trigger reflow
    cartCountEl.classList.add('bump');
}

function openCart() {
    cartOverlay.classList.add('active');
    cartSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartOverlay.classList.remove('active');
    cartSidebar.classList.remove('active');
    document.body.style.overflow = '';
}

function checkout() {
    if (cart.length === 0) return;

    let message = '🥗 *New Order from Salads by Preeti*\n\n';
    cart.forEach(item => {
        message += `• ${item.name} × ${item.qty} — ₹${item.price * item.qty}\n`;
    });
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    message += `\n*Total: ₹${total}*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/916377836802?text=${encoded}`, '_blank');
}

// ===== Modal Functions =====
function openModal(saladId) {
    const salad = salads.find(s => s.id === saladId);
    if (!salad) return;
    currentModalSalad = salad;

    document.getElementById('modal-image').src = salad.image;
    document.getElementById('modal-image').alt = salad.name;
    document.getElementById('modal-badge').textContent = salad.badge;
    document.getElementById('modal-title').textContent = salad.name;
    document.getElementById('modal-description').textContent = salad.description;
    document.getElementById('modal-calories').textContent = salad.calories;
    document.getElementById('modal-time').textContent = salad.time;
    document.getElementById('modal-serves').textContent = salad.serves;
    document.getElementById('modal-price').textContent = `₹${salad.price}`;

    const ingredientsEl = document.getElementById('modal-ingredients');
    ingredientsEl.innerHTML = `
        <h4>Ingredients</h4>
        <div class="ingredient-tags">
            ${salad.ingredients.map(i => `<span class="ingredient-tag">${i}</span>`).join('')}
        </div>
    `;

    modalOverlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentModalSalad = null;
}

function addToCartFromModal() {
    if (currentModalSalad) {
        addToCart(currentModalSalad.id);
        closeModal();
        setTimeout(() => openCart(), 300);
    }
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeCart();
    }
});

// ===== Mobile Menu Toggle =====
const mobileToggle = document.getElementById('mobile-toggle');
mobileToggle.addEventListener('click', () => {
    // Simple mobile menu logic (could be expanded)
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '72px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(254,253,248,0.98)';
    navLinks.style.flexDirection = 'column';
    navLinks.style.padding = '24px';
    navLinks.style.gap = '20px';
    navLinks.style.borderBottom = '1px solid #e8e4dc';
    navLinks.style.backdropFilter = 'blur(20px)';
});
