/*
 * main.js
 * Starts up the shopping website when the page loads.
 * initializes all the features and sets up event handlers.
 */

document.addEventListener('DOMContentLoaded', async function () {
    setFooterYear();
    loadCartFromStorage();
    await loadProducts();
    setupNav();
    setupAboutDialog();
    setupCartControls();
    setupBrowseControls();
    buildDynamicFilters();
    buildGenderFilterList();
    renderHome();

    // Shop now button takes you to browse page
    const homeShopNow = document.getElementById('homeShopNow');
    if (homeShopNow) {
        homeShopNow.addEventListener('click', function () {
            showView('browse');
        });
    }

     // Back button on product page returns to browse
    const productBack = document.getElementById('productBack');
    if (productBack) {
        productBack.addEventListener('click', function () {
            showView('browse');
        });
    }

    showView('home');
    updateCartCount();
});
