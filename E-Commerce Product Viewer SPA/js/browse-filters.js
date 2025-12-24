/*
 * browse-filters.js
 * Builds the filters for the Browse page.
 * Scans all products to create lists for category, size, and color,
 * and prepares the controls that let you narrow down what you see.
 */

// buildDynamicFilters: scans products and builds checkbox lists.
function buildDynamicFilters() {
    const categories = [];
    const sizes = [];
    const colors = [];

    for (let i = 0; i < state.products.length; i++) {
        const p = state.products[i];
        if (categories.indexOf(p.category) === -1) {
            categories.push(p.category);
        }
        for (let j = 0; j < p.sizes.length; j++) {
            const s = p.sizes[j];
            if (sizes.indexOf(s) === -1) {
                sizes.push(s);
            }
        }
        for (let k = 0; k < p.color.length; k++) {
            const c = p.color[k];
            if (colors.indexOf(c.name) === -1) {
                colors.push(c.name);
            }
        }
    }

    categories.sort();
    sizes.sort();
    colors.sort();

    populateCheckboxGroup('filter-category', categories);
    populateCheckboxGroup('filter-size', sizes);
    populateCheckboxGroup('filter-color', colors);
}

// buildGenderFilterList: populates the gender filter checkboxes.
function buildGenderFilterList() {
    const container = document.getElementById('genderFilterList');
    if (!container){
    return;
    } 
    container.textContent = '';

    const genders = [];
    for (let i = 0; i < state.products.length; i++) {
        const gender = state.products[i].gender;
        if (genders.indexOf(gender) === -1) {
            genders.push(gender);
        }
    }
    for (let i = 0; i < genders.length; i++) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'gender';
        input.value = genders[i];
        if (state.filters.gender.indexOf(genders[i]) !== -1) {
            input.checked = true;
        }
        input.addEventListener('change', function () {
            toggleFilter('gender', this.value, this.checked);
        });
        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + capitalize(genders[i])));
        container.appendChild(label);
    }
}

// populateCheckboxGroup: helper that fills a container with <label><input>.
function populateCheckboxGroup(containerId, values) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }
    container.textContent = '';
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = value;
        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + value));
        container.appendChild(label);
    }
}

// setupBrowseControls: wires sort dropdown, sort direction, clear filters, and filter sidebar changes. 
// container listens for change events to update a list.
function setupBrowseControls() {
    const sortField = document.getElementById('sortField');
    const sortDirection = document.getElementById('sortDirection');
    const clearFilters = document.getElementById('clearFilters');
    const filterSidebar = document.querySelector('.filters');

    if (sortField) {
        sortField.addEventListener('change', function () {
            state.sortField = this.value;
            renderBrowseResults();
        });
    }

    if (sortDirection) {
        sortDirection.addEventListener('click', function () {
            const dir = this.getAttribute('data-direction');
            let newDir;
            if (dir === 'asc') {
                newDir = 'desc';
            } else {
                newDir = 'asc';
            }
            this.setAttribute('data-direction', newDir);
            if (newDir === 'asc') {
                this.textContent = 'A-Z';
            } else {
                this.textContent = 'Z-A';
            }
            state.sortDirection = newDir;
            renderBrowseResults();
        });
    }

    if (clearFilters) {
        clearFilters.addEventListener('click', function () {
            const checkboxes = document.querySelectorAll('.filters input[type=checkbox]');
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = false;
            }
            state.filters.gender = [];
            state.filters.category = [];
            state.filters.size = [];
            state.filters.color = [];
            renderBrowseResults();
        });
    }

    if (filterSidebar) {
        filterSidebar.addEventListener('change', function (e) {
            if (e.target && e.target.type === 'checkbox') {
                updateFilterState();
                renderBrowseResults();
            }
        });
    }
}

// problems where form controls are read and a filtered list is rebuilt.
function updateFilterState() {
    state.filters.gender = getCheckedValues('filter-gender');
    state.filters.category = getCheckedValues('filter-category');
    state.filters.size = getCheckedValues('filter-size');
    state.filters.color = getCheckedValues('filter-color');
}

function getCheckedValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const inputs = container.querySelectorAll('input[type=checkbox]');
    const values = [];
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            values.push(inputs[i].value);
        }
    }
    return values;
}

// removeFilterChip: when a chip's X is clicked, unchecks the matching
// checkbox and re-renders. 
function removeFilterChip(type, value) {
    const containerId = 'filter-' + type;
    const container = document.getElementById(containerId);
    if (!container) return;
    const inputs = container.querySelectorAll('input[type=checkbox]');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === value) {
            inputs[i].checked = false;
            break;
        }
    }
    updateFilterState();
    renderBrowseResults();
}
