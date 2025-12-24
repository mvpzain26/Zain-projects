/*
 * cart.js
 * Manages your shopping cart, shows what you've added, and handles checkout.
 * Lets you change quantities, remove items, and see shipping costs and taxes.
 * Calculates your total based on where you live and how fast you want shipping.
 * Saves your cart so you don't lose it when you refresh the page.
 */

// setupCartControls: adds event listeners for shipping options and checkout button.
function setupCartControls() {
    const shippingMethod = document.getElementById('shippingMethod');
    const shippingDestination = document.getElementById('shippingDestination');
    const checkoutButton = document.getElementById('checkoutButton');

    if (shippingMethod) {
        shippingMethod.addEventListener('change', updateCartSummary);
    }
    if (shippingDestination) {
        shippingDestination.addEventListener('change', updateCartSummary);
    }
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function () {
            if (state.cart.length === 0) return;
            showToast('Checkout complete');
            state.cart = [];
            saveCartToStorage();
            updateCartCount();
            renderCartView();
            showView('home');
        });
    }
}

// renderCartView: builds the cart table with all your items and controls.
function renderCartView() {
    const tbody = document.getElementById('cartBody');
    if (!tbody) return;
    tbody.textContent = '';

    const emptyMsg = document.getElementById('emptyCartMessage');
    const hasItems = state.cart.length > 0;
    if (emptyMsg) {
        if (hasItems) {
            emptyMsg.classList.add('hidden');
        } else {
            emptyMsg.classList.remove('hidden');
        }
    }

    const shippingMethod = document.getElementById('shippingMethod');
    const shippingDestination = document.getElementById('shippingDestination');
    const checkoutButton = document.getElementById('checkoutButton');
    const disabled = !hasItems;
    if (shippingMethod) shippingMethod.disabled = disabled;
    if (shippingDestination) shippingDestination.disabled = disabled;
    if (checkoutButton) checkoutButton.disabled = disabled;

    for (let i = 0; i < state.cart.length; i++) {
        const item = state.cart[i];
        const tr = document.createElement('tr');

        const removeCell = document.createElement('td');
        const removeBtn = document.createElement('button');
        removeBtn.className = 'cart-remove-btn';
        removeBtn.textContent = '-';
        removeBtn.addEventListener('click', (function (it) {
            return function () {
                removeCartItem(it);
            };
        })(item));
        removeCell.appendChild(removeBtn);
        tr.appendChild(removeCell);

        const itemCell = document.createElement('td');
        const thumb = document.createElement('div');
        thumb.className = 'cart-thumb';
        thumb.style.backgroundColor = item.colorHex || '#e5e7eb';
        itemCell.appendChild(thumb);
        const nameDiv = document.createElement('div');
        nameDiv.textContent = item.name;
        itemCell.appendChild(nameDiv);
        tr.appendChild(itemCell);

        const colorCell = document.createElement('td');
        colorCell.textContent = item.color;
        tr.appendChild(colorCell);

        const sizeCell = document.createElement('td');
        sizeCell.textContent = item.size;
        tr.appendChild(sizeCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = '$' + item.price.toFixed(2);
        tr.appendChild(priceCell);

        const quantityCell = document.createElement('td');
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.value = item.quantity;
        quantityInput.className = 'cart-qty-input';
        quantityInput.addEventListener('change', (function (it) {
            return function () {
                const newQuantity = parseInt(this.value, 10) || 1;
                if (newQuantity < 1) newQuantity = 1;
                it.quantity = newQuantity;
                saveCartToStorage();
                updateCartCount();
                renderCartView();
            };
        })(item));
        quantityCell.appendChild(quantityInput);
        tr.appendChild(quantityCell);

        const subCell = document.createElement('td');
        const subtotal = item.price * item.quantity;
        subCell.textContent = '$' + subtotal.toFixed(2);
        tr.appendChild(subCell);

        tbody.appendChild(tr);
    }

    updateCartSummary();
}

// removeCartItem: removes an item from your cart and updates everything.
function removeCartItem(itemToRemove) {
    for (let i = 0; i < state.cart.length; i++) {
        if (state.cart[i] === itemToRemove) {
            state.cart.splice(i, 1);
            break;
        }
    }
    saveCartToStorage();
    updateCartCount();
    renderCartView();
}

// updateCartSummary: calculates merchandise total, shipping, tax, and final amount.
function updateCartSummary() {
    let merchandise = 0;
    for (let i = 0; i < state.cart.length; i++) {
        merchandise += state.cart[i].price * state.cart[i].quantity;
    }

    const shippingMethod = document.getElementById('shippingMethod');
    const shippingDestination = document.getElementById('shippingDestination');
    const method = shippingMethod ? shippingMethod.value : 'standard';
    const dest = shippingDestination ? shippingDestination.value : 'CA';

    const shipping = calculateShipping(merchandise, method, dest);
    const tax = calculateTax(merchandise, dest);
    const total = merchandise + shipping + tax;

    document.getElementById('summaryMerchandise').textContent = '$' + merchandise.toFixed(2);
    document.getElementById('summaryShipping').textContent = '$' + shipping.toFixed(2);
    document.getElementById('summaryTax').textContent = '$' + tax.toFixed(2);
    document.getElementById('summaryTotal').textContent = '$' + total.toFixed(2);
}


