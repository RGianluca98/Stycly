// Products catalog functionality
let allProducts = [];
let productsData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadFilters();
    loadProducts();

    // Set up filters
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const destinationFilter = document.getElementById('destinationFilter');
    const sizeFilter = document.getElementById('sizeFilter');
    const ageRangeFilter = document.getElementById('ageRangeFilter');
    const colorFilter = document.getElementById('colorFilter');
    const conditionFilter = document.getElementById('conditionFilter');

    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (destinationFilter) destinationFilter.addEventListener('change', filterProducts);
    if (sizeFilter) sizeFilter.addEventListener('change', filterProducts);
    if (ageRangeFilter) ageRangeFilter.addEventListener('change', filterProducts);
    if (colorFilter) colorFilter.addEventListener('change', filterProducts);
    if (conditionFilter) conditionFilter.addEventListener('change', filterProducts);
});

function loadFilters() {
    fetch('/shop/filters')
        .then(res => res.json())
        .then(filters => {
            // Populate category filter
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter && filters.categories) {
                filters.categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    categoryFilter.appendChild(option);
                });
            }

            // Populate destination filter
            const destinationFilter = document.getElementById('destinationFilter');
            if (destinationFilter && filters.destinations) {
                filters.destinations.forEach(dest => {
                    const option = document.createElement('option');
                    option.value = dest;
                    option.textContent = dest;
                    destinationFilter.appendChild(option);
                });
            }

            // Populate size filter
            const sizeFilter = document.getElementById('sizeFilter');
            if (sizeFilter && filters.sizes) {
                filters.sizes.forEach(size => {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = size;
                    sizeFilter.appendChild(option);
                });
            }

            // Populate age range filter
            const ageRangeFilter = document.getElementById('ageRangeFilter');
            if (ageRangeFilter && filters.age_ranges) {
                filters.age_ranges.forEach(age => {
                    const option = document.createElement('option');
                    option.value = age;
                    option.textContent = age;
                    ageRangeFilter.appendChild(option);
                });
            }

            // Populate color filter
            const colorFilter = document.getElementById('colorFilter');
            if (colorFilter && filters.colors) {
                filters.colors.forEach(color => {
                    const option = document.createElement('option');
                    option.value = color;
                    option.textContent = color;
                    colorFilter.appendChild(option);
                });
            }

            // Populate condition filter
            const conditionFilter = document.getElementById('conditionFilter');
            if (conditionFilter && filters.conditions) {
                filters.conditions.forEach(condition => {
                    const option = document.createElement('option');
                    option.value = condition;
                    option.textContent = condition;
                    conditionFilter.appendChild(option);
                });
            }
        })
        .catch(err => console.error('Error loading filters:', err));
}

function loadProducts() {
    fetch('/shop/products')
        .then(res => res.json())
        .then(products => {
            allProducts = products;
            productsData = products;
            displayProducts(products);
        })
        .catch(err => {
            console.error('Error loading products:', err);
            document.getElementById('productsGrid').innerHTML =
                '<p style="text-align: center; padding: 3rem;">Errore nel caricamento dei prodotti. Riprova più tardi.</p>';
        });
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 3rem; grid-column: 1/-1;">Nessun prodotto trovato che corrisponde ai tuoi criteri.</p>';
        return;
    }
    
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card">
                <div class="product-image-container">
                    ${renderProductGallery(product)}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${escapeHtml(product.title)}</h3>
                    <p class="product-meta">
                        ${product.size ? `Taglia: ${escapeHtml(product.size)}` : ''}
                    </p>
                    ${product.description ? `<p style="font-size: 0.9rem; color: #666; margin: 0.5rem 0;">${escapeHtml(product.description)}</p>` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; gap: 0.5rem; flex-wrap: wrap;">
                        ${product.destination ? `<span style="background: var(--col-accent); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">${escapeHtml(product.destination)}</span>` : ''}
                        ${product.category ? `<span style="background: var(--col-secondario); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">${escapeHtml(product.category)}</span>` : ''}
                        ${product.color ? `<span style="font-size: 0.9rem; color: #666;">${escapeHtml(product.color)}</span>` : ''}
                    </div>
                    ${product.condition ? `<p style="font-size: 0.85rem; color: #888; margin-top: 0.5rem;">Condizione: ${escapeHtml(product.condition)}</p>` : ''}
                    ${product.stock !== undefined ? `<p style="font-size: 0.85rem; color: ${product.stock > 0 ? '#28a745' : '#dc3545'}; margin-top: 0.25rem; font-weight: 600;">Disponibilità: ${product.stock}</p>` : ''}
                    <button class="btn btn-accent add-to-cart-btn" onclick="addToCart(${product.id})" style="margin-top: 1rem;">
                        <i class="fas fa-shopping-bag"></i> Richiedi Preventivo
                    </button>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const destination = document.getElementById('destinationFilter').value;
    const size = document.getElementById('sizeFilter').value;
    const ageRange = document.getElementById('ageRangeFilter').value;
    const color = document.getElementById('colorFilter').value;
    const condition = document.getElementById('conditionFilter').value;

    const filtered = allProducts.filter(product => {
        const matchesSearch = !searchTerm ||
            product.title.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));

        const matchesCategory = !category || product.category === category;
        const matchesDestination = !destination || product.destination === destination;
        const matchesSize = !size || product.size === size;
        const matchesAgeRange = !ageRange || product.age_range === ageRange;
        const matchesColor = !color || product.color === color;
        const matchesCondition = !condition || product.condition === condition;

        return matchesSearch && matchesCategory && matchesDestination &&
               matchesSize && matchesAgeRange && matchesColor && matchesCondition;
    });

    displayProducts(filtered);
}

function addToCart(itemId) {
    fetch('/shop/cart/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({item_id: itemId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            updateCartBadge();
            showNotification('Articolo aggiunto al carrello!', 'success');
            // Reload products to update available stock
            loadProducts();
        } else {
            showNotification(data.message || 'Impossibile aggiungere l\'articolo al carrello', 'error');
        }
    })
    .catch(err => {
        console.error('Error adding to cart:', err);
        showNotification('Errore nell\'aggiunta al carrello', 'error');
    });
}

function renderProductGallery(product) {
    if (!product.image_paths || product.image_paths.length === 0) {
        return `<img src="https://via.placeholder.com/300x300?text=No+Image" alt="No image" class="product-image">`;
    }

    if (product.image_paths.length === 1) {
        return `<img src="/static/${product.image_paths[0]}" alt="${escapeHtml(product.title)}" class="product-image">`;
    }

    // Multiple images - show first with gallery indicators
    return `
        <div class="wardrobe-item-gallery" data-item-id="product-${product.id}">
            <img src="/static/${product.image_paths[0]}" alt="${escapeHtml(product.title)}" id="product-gallery-img-${product.id}" class="product-image">
            <div class="gallery-indicators">
                ${product.image_paths.map((_, index) =>
                    `<span class="gallery-indicator ${index === 0 ? 'active' : ''}"
                          onclick="changeProductGalleryImage(${product.id}, ${index})"></span>`
                ).join('')}
            </div>
        </div>
    `;
}

function changeProductGalleryImage(productId, imageIndex) {
    const product = productsData.find(p => p.id === productId);
    if (!product || !product.image_paths || imageIndex >= product.image_paths.length) {
        return;
    }

    // Update image
    const imgElement = document.getElementById(`product-gallery-img-${productId}`);
    if (imgElement) {
        imgElement.src = `/static/${product.image_paths[imageIndex]}`;
    }

    // Update indicators
    const gallery = document.querySelector(`[data-item-id="product-${productId}"]`);
    if (gallery) {
        const indicators = gallery.querySelectorAll('.gallery-indicator');
        indicators.forEach((indicator, idx) => {
            if (idx === imageIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `flash flash-${type === 'success' ? 'success' : 'danger'}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="flash-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    let container = document.querySelector('.flash-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-container';
        document.body.appendChild(container);
    }

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
