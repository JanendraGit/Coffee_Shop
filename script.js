// Debounce function to limit the rate at which a function can fire.
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

const header = document.querySelector('header');
const backToTopButton = document.querySelector('.back-to-top');
const sections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('.nav-link');
const body = document.body;
const heroImage = document.querySelector('.hero-image');
const statNumbers = document.querySelectorAll('.stat-number');
const menuGrid = document.querySelector('.menu-grid');

// Scroll event listener
window.addEventListener('scroll', debounce(() => {
    // Navbar scroll effect
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Back to Top button visibility
    if (window.scrollY > 300) {
        backToTopButton.style.visibility = 'visible';
        backToTopButton.style.opacity = '1';
    } else {
        backToTopButton.style.visibility = 'hidden';
        backToTopButton.style.opacity = '0';
    }

    // Active link highlighting
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 70) { // Adjusted offset to match scroll-padding-top
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href.includes(current)) {
            link.classList.add('active');
        }
    });
     // If no section is active (e.g., at the very top), highlight the Home link
    if (!current) {
        const homeLink = document.querySelector('.nav-link[href="#"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }
    
    // Parallax effect for hero image
    const scrollPosition = window.pageYOffset;
    heroImage.style.transform = `translateY(${scrollPosition * 0.3}px)`;

}));


// Fade-in on scroll
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -100px 0px"
};

const appearOnScroll = new IntersectionObserver(function(
    entries,
    appearOnScroll
) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('appear');
            if (entry.target.classList.contains('stats-container')) {
                animateCounters();
            }
            appearOnScroll.unobserve(entry.target);
        }
    });
},
appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// Animated Counters
function animateCounters() {
    statNumbers.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const stepTime = Math.abs(Math.floor(duration / target));
        let current = 0;
        const timer = setInterval(() => {
            current += 1;
            counter.innerText = current;
            if (current == target) {
                clearInterval(timer);
            }
        }, stepTime);
    });
}

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    body.classList.toggle('body-no-scroll');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    body.classList.remove('body-no-scroll');
}));

// Shopping Cart
const cartIcon = document.querySelector('.cart-icon');
const cartPanel = document.querySelector('.cart-panel');
const cartOverlay = document.querySelector('.cart-overlay');
const closeCartBtn = document.querySelector('.close-cart-btn');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotalElement = document.querySelector('.cart-total-price');
const cartItemCountElement = document.querySelector('.cart-item-count');

let cart = [];

function toggleCart() {
    cartPanel.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    body.classList.toggle('body-no-scroll');
}

cartIcon.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

function addToCart(id, title, price, image) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, title, price, image, quantity: 1 });
    }

    updateCart();
}

function updateCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <input type="number" value="${item.quantity}" min="1" readonly>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">&times;</button>
        `;
        cartItemsContainer.appendChild(cartItem);

        total += item.price * item.quantity;
        itemCount += item.quantity;
    });

    cartTotalElement.innerText = `$${total.toFixed(2)}`;
    cartItemCountElement.innerText = itemCount;

    // Add event listeners for quantity buttons and remove buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', handleQuantityChange);
    });

    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', handleRemoveItem);
    });
}

function handleQuantityChange(e) {
    const id = e.target.dataset.id;
    const action = e.target.dataset.action;
    const item = cart.find(item => item.id === id);

    if (action === 'increase') {
        item.quantity++;
    } else if (action === 'decrease') {
        item.quantity--;
        if (item.quantity === 0) {
            cart = cart.filter(item => item.id !== id);
        }
    }

    updateCart();
}

function handleRemoveItem(e) {
    const id = e.target.dataset.id;
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

// Fetch menu items from the backend
async function fetchMenu() {
    try {
        const response = await fetch('/api/menu');
        const menuItems = await response.json();
        renderMenu(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
    }
}

function renderMenu(menuItems) {
    menuGrid.innerHTML = '';
    menuItems.forEach(item => {
        const menuCard = document.createElement('div');
        menuCard.classList.add('menu-card');
        menuCard.dataset.id = item.id;

        let badge = '';
        if (item.category) {
            badge = `<span class="badge ${item.category.toLowerCase()}">${item.category}</span>`;
        }

        menuCard.innerHTML = `
            <div class="menu-card-image">
                <img src="${item.image}" alt="${item.name}">
                ${badge}
            </div>
            <div class="menu-card-content">
                <h3 class="menu-card-title">${item.name}</h3>
                <p class="menu-card-description">${item.description}</p>
                <p class="menu-card-price">$${item.price.toFixed(2)}</p>
                <button class="btn add-to-cart-btn">Add to Cart</button>
            </div>
        `;
        menuGrid.appendChild(menuCard);
    });

    // Re-add event listeners for the new "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const menuCard = e.target.closest('.menu-card');
            const id = menuCard.dataset.id;
            const title = menuCard.querySelector('.menu-card-title').innerText;
            const price = parseFloat(menuCard.querySelector('.menu-card-price').innerText.replace('$', ''));
            const image = menuCard.querySelector('.menu-card-image img').src;

            addToCart(id, title, price, image);
        });
    });
}


// Set initial states
document.addEventListener('DOMContentLoaded', () => {
    // Set initial word animation delays
    document.querySelectorAll('.hero-title .word').forEach((word, i) => {
        word.style.setProperty('--i', i);
    });

    fetchMenu();
});