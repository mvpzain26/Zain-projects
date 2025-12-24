/*
 * browse-results.js
 * Uses the current filters and sort settings to decide which products to show.
 * Updates the Browse grid, result count, and "no results" message whenever the
 * user changes filters or sort options.
 */

/**
 * Main entry point to build the Browse results grid.
 * Applies filters/sort, updates counts/messages, and renders product cards.
 */
function renderBrowseResults() {
    const container = document.getElementById('browseResults');
    if (!container) {
        return;
    }
    container.textContent = '';

    const filtered = applyFilters(state.products);
    const sorted = applySort(filtered);

    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = sorted.length;
    }

    const noResults = document.getElementById('noResultsMessage');
    if (noResults) {
        if (sorted.length > 0) {
            noResults.classList.add('hidden');
        } else {
            noResults.classList.remove('hidden');
        }
    }

    renderActiveFilterChips();

    for (let i = 0; i < sorted.length; i++) {
        const card = createProductCard(sorted[i]);
        container.appendChild(card);
    }
}

// Returns only products matching the current filter selections.
function applyFilters(list) {
    // Each filter returns early if the current product does not match.
    return list.filter(function (product) {
        if (state.filters.gender.length && state.filters.gender.indexOf(product.gender) === -1) {
            return false;
        }
        if (state.filters.category.length && state.filters.category.indexOf(product.category) === -1) {
            return false;
        }
        if (state.filters.size.length) {
            const matchesSize = state.filters.size.some(function (s) {
                return product.sizes.indexOf(s) !== -1;
            });
            if (!matchesSize) {
                return false;
            }
        }
        if (state.filters.color.length) {
            const matchesColor = state.filters.color.some(function (c) {
                return product.color.some(function (pc) {
                    return pc.name === c;
                });
            });
            if (!matchesColor) {
                return false;
            }
        }
        return true;
    });
}

// Sorts products by the active field/direction using a simple comparator.
function applySort(list) {
    const field = state.sortField;
    let dir;
    if (state.sortDirection === 'asc') {
        dir = 1;
    } else {
        dir = -1;
    }
    // Create a copy using a loop
    const copy = [];
    for (let i = 0; i < list.length; i++) {
        copy.push(list[i]);
    }

    return copy.sort(function (a, b) {
        let v1;
        let v2;
        if (field === 'price') {
            v1 = a.price;
            v2 = b.price;
        } else if (field === 'category') {
            v1 = a.category.toLowerCase();
            v2 = b.category.toLowerCase();
        } else {
            v1 = a.name.toLowerCase();
            v2 = b.name.toLowerCase();
        }
        if (v1 < v2) {
            return -1 * dir;
        }
        if (v1 > v2) {
            return 1 * dir;
        }
        return 0;
    });
}

/**
 * Shows chips with X buttons for each active filter and wires removal clicks.
 * Uses a delegated click handler 
 */
function renderActiveFilterChips() {
    const container = document.getElementById('activeFilters');
    if (!container) {
        return;
    }
    container.textContent = '';

    // Render chips for a given filter type (e.g., gender) and its values.
    function addChips(type, values) {
        for (let i = 0; i < values.length; i++) {
            const v = values[i];
            const chip = document.createElement('span');
            chip.className = 'filter-chip';
            chip.appendChild(document.createTextNode(v + ' '));
            const btn = document.createElement('button');
            btn.type = 'button';
            // Store type/value on the button so the click handler knows what to remove.
            btn.dataset.filterType = type;
            btn.dataset.filterValue = v;
            btn.textContent = 'x';
            chip.appendChild(btn);
            container.appendChild(chip);
        }
    }

    addChips('gender', state.filters.gender);
    addChips('category', state.filters.category);
    addChips('size', state.filters.size);
    addChips('color', state.filters.color);

    // Delegate clicks from the container to cover all current/future chips.
    container.addEventListener('click', function (e) {
        if (e.target && e.target.tagName.toLowerCase() === 'button') {
            removeFilterChip(e.target.dataset.filterType, e.target.dataset.filterValue);
        }
    });
}
