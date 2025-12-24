/*
 * product.js
 * Builds product cards for the Home, Browse, and Related sections.
 * Shows a detailed single product view when you click a product.
 * Lets you select size, color, and quantity, then add to cart.
 * Handles quick “+ Cart” buttons from product cards.
 * Merges duplicate cart items automatically so you don’t get duplicates.
 */

// createProductCard: builds a product card for display in lists.
function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const img = document.createElement('div');
    img.className = 'product-card-image';
    if (product.color && product.color.length > 0) {
        img.style.backgroundColor = product.color[0].hex;
    }
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'product-card-body';

    const title = document.createElement('h3');
    title.textContent = product.name;
    body.appendChild(title);

    const price = document.createElement('div');
    price.className = 'product-card-price';
    price.textContent = '$' + product.price.toFixed(2);
    body.appendChild(price);

    const meta = document.createElement('div');
    meta.className = 'product-card-meta';
    meta.textContent = product.gender + ' - ' + product.category;
    body.appendChild(meta);

    card.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'product-card-actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'secondary-button small';
    viewBtn.textContent = 'View';

    const addBtn = document.createElement('button');
    addBtn.className = 'primary-button small';
    addBtn.textContent = '+ Cart';

    actions.appendChild(viewBtn);
    actions.appendChild(addBtn);
    card.appendChild(actions);

    // change the main content area instead of visiting a new page.
    viewBtn.addEventListener('click', function () {
        openProduct(product.id);
    });
    addBtn.addEventListener('click', function () {
        quickAddToCart(product.id);
    });
    img.addEventListener('click', function () {
        openProduct(product.id);
    });
    title.addEventListener('click', function () {
        openProduct(product.id);
    });

    return card;
    }

// openProduct: shows the single product view with all details.
function openProduct(productId) {
    let product = null;
    for (let i = 0; i < state.products.length; i++) {
        if (state.products[i].id === productId) {
            product = state.products[i];
            break;
        }
    }
    if (!product) return;

    state.currentProductId = product.id;

    const crumbs = document.getElementById('productBreadcrumbs');
    if (crumbs) {
        crumbs.textContent = '';
        crumbs.appendChild(document.createTextNode('Home > ' + capitalize(product.gender) + ' > ' + product.category + ' > ' + product.name));
    }
    
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productPrice').textContent = '$' + product.price.toFixed(2);
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productMaterial').textContent = product.material;

    const mainImg = document.getElementById('productMainImage');
    if (mainImg) {
        if (product.color && product.color.length > 0) {
            mainImg.style.backgroundColor = product.color[0].hex;
        } else {
            mainImg.style.backgroundColor = '#e5e7eb';
        }
    }

    const sizeSelect = document.getElementById('productSize');
    sizeSelect.textContent = '';
    for (let j = 0; j < product.sizes.length; j++) {
        const optS = document.createElement('option');
        optS.value = product.sizes[j];
        optS.textContent = product.sizes[j];
        sizeSelect.appendChild(optS);
    }

    const colorSelect = document.getElementById('productColor');
    colorSelect.textContent = '';
    for (let k = 0; k < product.color.length; k++) {
        const optC = document.createElement('option');
        optC.value = product.color[k].name;
        optC.textContent = product.color[k].name;
        colorSelect.appendChild(optC);
    }

    const quantityInput = document.getElementById('productQuantity');
    quantityInput.value = 1;

    const form = document.getElementById('productOptions');
    form.onsubmit = function (e) {
        e.preventDefault();
        const size = sizeSelect.value;
        const colorName = colorSelect.value;
        const quantity = parseInt(quantityInput.value, 10) || 1;
        addItemToCart(product, size, colorName, quantity);
        showToast('Added to cart');
    };

    renderRelatedProducts(product);
    showView('product');
}

// Show up to four other products that share gender and category.
function renderRelatedProducts(product) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;
    container.textContent = ''; // Clear previous related cards.
    // Gather matching products (excluding the current one) until we have four.
    const related = [];
    for (let i = 0; i < state.products.length && related.length < 4; i++) {
        const p = state.products[i];
        if (p.id !== product.id && p.gender === product.gender && p.category === product.category) {
            related.push(p);
        }
    }
    // Build and append small cards for each related product found.
    for (let i = 0; i < related.length; i++) {
        const card = createProductCard(related[i]);
        container.appendChild(card);
    }
}

// quickAddToCart: adds one default size/color when clicking a related card.
function quickAddToCart(productId) {
    let product = null;
    for (let i = 0; i < state.products.length; i++) {
        if (state.products[i].id === productId) {
            product = state.products[i];
            break;
        }
    }
    if (!product){
        return;
    } 
    const size = product.sizes[0];
    const colorName = product.color.length > 0 ? product.color[0].name : '';
    addItemToCart(product, size, colorName, 1);
    showToast('Added to cart');
}

// addItemToCart: merge with existing cart entry for same product/size/color and persist.
function addItemToCart(product, size, colorName, quantity) {
    if (!quantity || quantity < 1) quantity = 1;

    let colorObj = product.color[0];
    for (let i = 0; i < product.color.length; i++) {
        if (product.color[i].name === colorName) {
            colorObj = product.color[i];
            break;
        }
    }

    let found = null;
    for (let j = 0; j < state.cart.length; j++) {
        const item = state.cart[j];
        if (item.id === product.id && item.size === size && item.color === colorObj.name) {
            found = item;
            break;
        }
    }

    if (found) {
        found.quantity += quantity;
    } else {
        state.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            size: size,
            color: colorObj.name,
            colorHex: colorObj.hex,
            quantity: quantity
        });
    }

    saveCartToStorage();
    updateCartCount();
}






