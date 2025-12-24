/*
 * home.js
 * Controls the Home view and shows a small set of featured products.
 * Uses the shared product list in state to build product cards on the front page.
 */

// renderHomeView: selects top sellers and displays them as cards on Home.
function renderHome() {
    const container = document.getElementById('homeFeatured');
    if (!container) return;
    container.textContent = '';

    for (let i = 0; i < state.products.length && i < 4; i++) {
        const card = createProductCard(state.products[i]);
        container.appendChild(card);
    }
}

