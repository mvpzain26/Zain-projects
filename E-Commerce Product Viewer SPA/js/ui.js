/*
 * ui.js
 * Shared UI helpers for the shopping website.
 * Manages navigation between pages, shows feedback messages, and handles the About dialog.
 * Updates the footer year and keeps everything working smoothly.
 */

// setFooterYear: updates the copyright year in the footer automatically.
function setFooterYear() {
    const yearSpan = document.getElementById('footerYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Shows one main view at a time by toggling a CSS class.
function showView(viewName) {
    state.currentView = viewName;
    const views = document.querySelectorAll('.view');
    for (let i = 0; i < views.length; i++) {
        views[i].classList.add('hidden');
    }
    const active = document.getElementById('view-' + viewName);
    if (active) {
        active.classList.remove('hidden');
    }
    if (viewName === 'browse') {
        renderBrowseResults();
    }
    if (viewName === 'cart') {
        renderCartView();
    }
}
// showToast: shows a temporary message at the bottom of the screen.
function showToast(message) {
    const bar = document.getElementById('toast');
    if (!bar) return;
    bar.textContent = message;
    // Re-show toast by forcing the visible class, then hide it after the timeout.
    bar.classList.remove('hidden');
    bar.classList.add('show');
    setTimeout(function () {
        bar.classList.remove('show');
        bar.classList.add('hidden');
    }, 3000);
}

// Top navigation links and cart link 
function setupNav() {
    const navLinks = document.querySelectorAll('[data-view]');
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function (e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            // Each nav link declares the target view via data-view.
            if (view) {
                showView(view);
            }
        });
    }

    const cartLink = document.getElementById('cartLink');
    if (cartLink) {
        cartLink.addEventListener('click', function () {
            // Cart is a special view without a data-view attribute.
            showView('cart');
        });
    }
}

// setupAboutDialog: handles the About popup window.
function setupAboutDialog() {
    // Grab dialog shell and the controls that open/close it.
    const dialog = document.getElementById('aboutDialog');
    const openLink = document.getElementById('aboutLink');
    const closeBtn = document.getElementById('aboutClose');
    const closeFooterBtn = document.getElementById('aboutCloseFooter');
    // Single source for the repo URL so it stays consistent.
    const githubUrl = 'https://github.com/mvpzain26/Zain-projects.git';

    const githubLink = document.getElementById('githubLink');
    const footerGithubLink = document.getElementById('footerGithubLink');
    // Keep both header/footer GitHub anchors in sync.
    if (githubLink) {
        githubLink.href = githubUrl;
    }
    if (footerGithubLink) {
        footerGithubLink.href = githubUrl;
    }

    // Bail out if key elements are missing (older browsers or markup tweaks).
    if (!dialog || !openLink) {
        return;
    }

    // Feature detect <dialog>; fall back to a simple alert.
    if (!dialog.showModal) {
        openLink.addEventListener('click', function (e) {
            e.preventDefault();
            alert('About dialog not supported in this browser.');
        });
        return;
    }

    // Open dialog modally when About link is clicked.
    openLink.addEventListener('click', function (e) {
        e.preventDefault();
        dialog.showModal();
    });

    // Shared close handler for both close buttons.
    function closeDialog() {
        dialog.close();
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeDialog);
    }
    if (closeFooterBtn) {
        closeFooterBtn.addEventListener('click', closeDialog);
    }
}
