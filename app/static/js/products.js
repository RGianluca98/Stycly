// Products catalog functionality
let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    
    // Set up filters
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const ageFilter = document.getElementById('ageFilter');
    const sizeFilter = document.getElementById('sizeFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (ageFilter) ageFilter.addEventListener('change', filterProducts);
    if (sizeFilter) sizeFilter.addEventListener('change', filterProducts);
});

function loadProducts() {
    fetch('/shop/products')
        .then(res => res.json())
        .then(products => {
            allProducts = products;
            displayProducts(products);
        })
        .catch(err => {
            console.error('Error loading products:', err);
            document.getElementById('productsGrid').innerHTML = 
                '<p style="text-align: center; padding: 3rem;">Error loading products. Please try again later.</p>';
        });
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 3rem; grid-column: 1/-1;">No products found matching your criteria.</p>';
        return;
    }
    
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card">
                <img src="/static/${product.image_path}" alt="${product.title}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-meta">
                        ${product.size ? `Size: ${product.size}` : ''} 
                        ${product.age_range ? `| Age: ${product.age_range}` : ''}
                    </p>
                    ${product.description ? `<p style="font-size: 0.9rem; color: #666; margin: 0.5rem 0;">${product.description.substring(0, 100)}...</p>` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                        ${product.category ? `<span style="background: var(--col-secondario); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">${product.category}</span>` : '<span></span>'}
                        ${product.color ? `<span style="font-size: 0.9rem; color: #666;">Color: ${product.color}</span>` : ''}
                    </div>
                    <p class="product-price">€${product.daily_price.toFixed(2)}/day</p>
                    <button class="btn btn-accent add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value.toLowerCase();
    const age = document.getElementById('ageFilter').value.toLowerCase();
    const size = document.getElementById('sizeFilter').value.toLowerCase();
    
    const filtered = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.title.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.color && product.color.toLowerCase().includes(searchTerm)) ||
            (product.category && product.category.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !category || (product.category && product.category.toLowerCase() === category);
        const matchesAge = !age || (product.age_range && product.age_range.toLowerCase() === age);
        const matchesSize = !size || (product.size && product.size.toLowerCase() === size);
        
        return matchesSearch && matchesCategory && matchesAge && matchesSize;
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
            showNotification('Item added to cart!', 'success');
        } else {
            showNotification(data.message || 'Could not add item to cart', 'error');
        }
    })
    .catch(err => {
        console.error('Error adding to cart:', err);
        showNotification('Error adding to cart', 'error');
    });
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
