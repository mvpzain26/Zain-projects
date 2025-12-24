/*
 * state.js
 * Shared application state and data-loading helpers.
 * Loads all clothing data from the internet so the site can display products.
 * Remembers your cart even if you refresh the page (using localStorage).
 * Keeps the cart number updated in the header so you always see how many items you have.
 * Calculates shipping and tax when you’re ready to check out, based on where you live and how fast you want it.
 * Formats text nicely (e.g., turns “womens” into “Womens”) for consistent display.
 */

const DATA_URL = 'https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json';
const STORAGE_PRODUCTS_KEY = 'spa_products';
const STORAGE_CART_KEY = 'spa_cart';

// Global state for the single page application.
let state = {
    products: [],
    cart: [],
    currentView: 'home',
    currentProductId: null,
    filters: {
        gender: [],
        category: [],
        size: [],
        color: []
    },
    sortField: 'name',
    sortDirection: 'asc'
};

// Load product data once, caching to localStorage.
// Uses fetch + JSON + localStorage.
async function loadProducts() {
    const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (stored) {
        state.products = JSON.parse(stored);
        return;
    }

    try {
        const response = await fetch(DATA_URL);
        const data = await response.json();
        state.products = data;
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(data));
    } catch (err) {
        console.error(err);
        // showToast is defined in ui js file.
        showToast('Error loading products');
    }
}

// Cart functionality using localStorage
function loadCartFromStorage() {
    const stored = localStorage.getItem(STORAGE_CART_KEY);
    if (stored) {
        state.cart = JSON.parse(stored);
    } else {
        state.cart = [];
    }
}

function saveCartToStorage() {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(state.cart));
}

function updateCartCount() {
    const span = document.getElementById('cartCount');
    if (!span) return;
    let totalQuantity = 0;
    for (let i = 0; i < state.cart.length; i++) {
        totalQuantity += state.cart[i].quantity;
    }
    span.textContent = totalQuantity;
}

// Shipping and tax rules from the assignment instructions
function calculateShipping(merchandise, method, dest) {
    if (merchandise === 0) return 0;
    if (merchandise > 500) return 0;
    var table = {
        standard: { CA: 10, US: 15, INTL: 20 },
        express: { CA: 25, US: 25, INTL: 30 },
        priority: { CA: 35, US: 50, INTL: 50 }
    };
    return table[method][dest];
}

function calculateTax(merchandise, dest) {
    if (dest !== 'CA') return 0;
    return merchandise * 0.05;
}

// String formatter for turning "womens" into "Womens" etc.
function capitalize(str) {
    if (!str) return '';
    const firstLetter = str[0].toUpperCase();
    let remainingLetters = '';
    for (let i = 1; i < str.length; i++) {
        remainingLetters += str[i];
    }
    return firstLetter + remainingLetters;
}

