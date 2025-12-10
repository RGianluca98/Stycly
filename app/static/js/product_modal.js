/**
 * Professional Product Detail Modal
 * Features: Image gallery, zoom, selectors, quantity, accessibility
 */

// Modal State
let modalState = {
    isOpen: false,
    currentProduct: null,
    currentImageIndex: 0,
    selectedSize: null,
    selectedColor: null,
    quantity: 1,
    maxQuantity: 10,
    focusTrap: null
};

// DOM Elements
const elements = {
    modal: null,
    backdrop: null,
    container: null,
    close: null,
    mainImage: null,
    thumbnails: null,
    dots: null,
    title: null,
    stock: null,
    description: null,
    expandBtn: null,
    descriptionFull: null,
    sizeOptions: null,
    colorOptions: null,
    qtyInput: null,
    addToCartBtn: null,
    toast: null
};

// Initialize Modal
function initProductModal() {
    // Cache DOM elements
    elements.modal = document.getElementById('productDetailModal');
    elements.backdrop = elements.modal?.querySelector('.pdm-backdrop');
    elements.container = elements.modal?.querySelector('.pdm-container');
    elements.close = elements.modal?.querySelector('.pdm-close');
    elements.mainImage = document.getElementById('pdmMainImage');
    elements.thumbnails = document.getElementById('pdmThumbnails');
    elements.dots = document.getElementById('pdmDots');
    elements.title = document.getElementById('pdm-title');
    elements.stock = document.getElementById('pdmStock');
    elements.description = document.getElementById('pdmDescriptionText');
    elements.expandBtn = document.getElementById('pdmExpandBtn');
    elements.descriptionFull = document.getElementById('pdmDescriptionFull');
    elements.sizeOptions = document.getElementById('pdmSizeOptions');
    elements.colorOptions = document.getElementById('pdmColorOptions');
    elements.qtyInput = document.getElementById('pdmQtyInput');
    elements.addToCartBtn = document.getElementById('pdmAddToCartBtn');
    elements.toast = document.getElementById('pdmToast');

    // Event Listeners
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    // Close modal on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalState.isOpen) {
            closeProductDetail();
        }
    });

    // Prevent body scroll when modal is open
    const preventScroll = (e) => {
        if (modalState.isOpen && !elements.container.contains(e.target)) {
            e.preventDefault();
        }
    };

    // Touch events for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;

    elements.modal?.addEventListener('touchstart', (e) => {
        if (modalState.isOpen) {
            touchStartX = e.changedTouches[0].screenX;
        }
    });

    elements.modal?.addEventListener('touchend', (e) => {
        if (modalState.isOpen) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }
    });

    function handleSwipe() {
        const threshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left - next image
                changeImage('next');
            } else {
                // Swipe right - previous image
                changeImage('prev');
            }
        }
    }
}

// Open Modal
function openProductDetail(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    modalState.currentProduct = product;
    modalState.currentImageIndex = 0;
    modalState.quantity = 1;
    modalState.selectedSize = product.size;
    modalState.selectedColor = product.color;

    // Populate modal content
    populateModal(product);

    // Open modal
    elements.modal.classList.add('is-open');
    elements.modal.setAttribute('aria-hidden', 'false');
    modalState.isOpen = true;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus trap
    trapFocus();

    // Set focus to close button
    setTimeout(() => {
        elements.close?.focus();
    }, 300);
}

// Close Modal
function closeProductDetail() {
    elements.modal.classList.remove('is-open');
    elements.modal.setAttribute('aria-hidden', 'true');
    modalState.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Clear focus trap
    if (modalState.focusTrap) {
        document.removeEventListener('keydown', modalState.focusTrap);
    }

    // Reset state
    setTimeout(() => {
        modalState.currentProduct = null;
        modalState.currentImageIndex = 0;
    }, 300);
}

// Populate Modal with Product Data
function populateModal(product) {
    // Title
    if (elements.title) {
        elements.title.textContent = product.title || 'Prodotto';
    }

    // Images
    setupImageGallery(product);

    // Badges
    setupBadges(product);

    // Stock
    setupStock(product);

    // Description
    if (elements.description) {
        const desc = product.description || 'Bellissimo capo per bambini, perfetto per ogni occasione.';
        elements.description.textContent = desc.substring(0, 120) + (desc.length > 120 ? '...' : '');
    }

    if (document.getElementById('pdmDescriptionFullText')) {
        document.getElementById('pdmDescriptionFullText').textContent = product.description || desc;
    }

    // Size options
    setupSizeOptions(product);

    // Color options (if available)
    setupColorOptions(product);

    // Quantity
    const maxQty = Math.min(product.stock || 10, 10);
    modalState.maxQuantity = maxQty;
    if (elements.qtyInput) {
        elements.qtyInput.max = maxQty;
        elements.qtyInput.value = 1;
    }

    // Update Add to Cart button
    updateAddToCartButton(product);
}

// Setup Image Gallery
function setupImageGallery(product) {
    const images = product.image_paths || [];

    if (images.length === 0) {
        // Fallback image
        if (elements.mainImage) {
            elements.mainImage.src = `https://via.placeholder.com/600x800?text=${encodeURIComponent(product.title)}`;
        }
        return;
    }

    // Set main image
    if (elements.mainImage) {
        elements.mainImage.src = `/static/${images[0]}`;
        elements.mainImage.alt = product.title;
    }

    // Update counter
    document.getElementById('pdmCurrentImage').textContent = '1';
    document.getElementById('pdmTotalImages').textContent = images.length;

    // Setup thumbnails
    if (elements.thumbnails && images.length > 1) {
        elements.thumbnails.innerHTML = '';

        images.forEach((img, index) => {
            const thumb = document.createElement('div');
            thumb.className = `pdm-thumbnail ${index === 0 ? 'is-active' : ''}`;
            thumb.onclick = () => selectImage(index);
            thumb.innerHTML = `<img src="/static/${img}" alt="Image ${index + 1}" loading="lazy">`;
            elements.thumbnails.appendChild(thumb);
        });
    }

    // Setup dots (mobile)
    if (elements.dots && images.length > 1) {
        elements.dots.innerHTML = '';

        images.forEach((img, index) => {
            const dot = document.createElement('div');
            dot.className = `pdm-dot ${index === 0 ? 'is-active' : ''}`;
            dot.onclick = () => selectImage(index);
            elements.dots.appendChild(dot);
        });
    }
}

// Select Image
function selectImage(index) {
    const product = modalState.currentProduct;
    if (!product || !product.image_paths) return;

    const images = product.image_paths;
    if (index < 0 || index >= images.length) return;

    modalState.currentImageIndex = index;

    // Update main image
    if (elements.mainImage) {
        elements.mainImage.src = `/static/${images[index]}`;
    }

    // Update counter
    document.getElementById('pdmCurrentImage').textContent = index + 1;

    // Update thumbnails
    const thumbs = elements.thumbnails?.querySelectorAll('.pdm-thumbnail');
    thumbs?.forEach((thumb, i) => {
        thumb.classList.toggle('is-active', i === index);
    });

    // Update dots
    const dots = elements.dots?.querySelectorAll('.pdm-dot');
    dots?.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
    });
}

// Change Image (next/prev)
function changeImage(direction) {
    const product = modalState.currentProduct;
    if (!product || !product.image_paths) return;

    const totalImages = product.image_paths.length;
    let newIndex = modalState.currentImageIndex;

    if (direction === 'next') {
        newIndex = (newIndex + 1) % totalImages;
    } else {
        newIndex = (newIndex - 1 + totalImages) % totalImages;
    }

    selectImage(newIndex);
}

// Setup Badges
function setupBadges(product) {
    const badgesContainer = document.getElementById('pdmBadges');
    if (!badgesContainer) return;

    let html = '';

    if (product.category) {
        html += `<span class="pdm-badge pdm-badge-category">${escapeHtml(product.category)}</span>`;
    }

    if (product.destination) {
        html += `<span class="pdm-badge pdm-badge-destination">${escapeHtml(product.destination)}</span>`;
    }

    if (product.condition) {
        html += `<span class="pdm-badge pdm-badge-condition">${escapeHtml(product.condition)}</span>`;
    }

    badgesContainer.innerHTML = html;
}

// Setup Stock Indicator
function setupStock(product) {
    if (!elements.stock) return;

    const stock = product.stock || 0;
    let html = '';
    let className = '';

    if (stock > 5) {
        className = 'in-stock';
        html = `<i class="fas fa-check-circle"></i> Disponibile (${stock} pezzi)`;
    } else if (stock > 0) {
        className = 'low-stock';
        html = `<i class="fas fa-exclamation-triangle"></i> Solo ${stock} rimasti!`;
    } else {
        className = 'out-of-stock';
        html = `<i class="fas fa-times-circle"></i> Esaurito`;
    }

    elements.stock.className = `pdm-stock ${className}`;
    elements.stock.innerHTML = html;
}

// Setup Size Options
function setupSizeOptions(product) {
    if (!elements.sizeOptions) return;

    const size = product.size || 'Unica';
    const ageRange = product.age_range;

    let html = `
        <button class="pdm-size-option is-selected" data-size="${escapeHtml(size)}">
            ${escapeHtml(size)}
        </button>
    `;

    if (ageRange) {
        html += `
            <button class="pdm-size-option is-disabled" disabled>
                ${escapeHtml(ageRange)}
            </button>
        `;
    }

    elements.sizeOptions.innerHTML = html;

    // Add click listeners
    elements.sizeOptions.querySelectorAll('.pdm-size-option:not(.is-disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            selectSize(this.dataset.size);
        });
    });
}

// Select Size
function selectSize(size) {
    modalState.selectedSize = size;

    elements.sizeOptions?.querySelectorAll('.pdm-size-option').forEach(btn => {
        btn.classList.toggle('is-selected', btn.dataset.size === size);
    });

    // Update stock hint if needed
    const hintElement = document.getElementById('pdmSizeStockHint');
    if (hintElement) {
        hintElement.textContent = `Taglia ${size} selezionata`;
    }
}

// Setup Color Options
function setupColorOptions(product) {
    if (!product.color) return;

    const colorGroup = document.getElementById('pdmColorGroup');
    if (colorGroup) {
        colorGroup.style.display = 'block';
    }

    if (!elements.colorOptions) return;

    const color = product.color;
    const colorCode = getColorCode(color);

    const html = `
        <button class="pdm-color-option is-selected"
                data-color="${escapeHtml(color)}"
                style="background: ${colorCode};">
        </button>
    `;

    elements.colorOptions.innerHTML = html;

    const colorNameEl = document.getElementById('pdmColorName');
    if (colorNameEl) {
        colorNameEl.textContent = color;
    }
}

// Get Color Code
function getColorCode(colorName) {
    const colorMap = {
        'White': '#FFFFFF',
        'Black': '#000000',
        'Red': '#FF0000',
        'Blue': '#0000FF',
        'Green': '#00FF00',
        'Yellow': '#FFFF00',
        'Pink': '#FFC0CB',
        'Purple': '#800080',
        'Orange': '#FFA500',
        'Brown': '#A52A2A',
        'Grey': '#808080',
        'Gray': '#808080'
    };

    return colorMap[colorName] || 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)';
}

// Update Add to Cart Button
function updateAddToCartButton(product) {
    if (!elements.addToCartBtn) return;

    const stock = product.stock || 0;

    if (stock <= 0) {
        elements.addToCartBtn.disabled = true;
        document.getElementById('pdmBtnText').textContent = 'Esaurito';
    } else {
        elements.addToCartBtn.disabled = false;
        document.getElementById('pdmBtnText').textContent = 'Aggiungi al Carrello';
    }
}

// Quantity Functions
function decreaseQty() {
    if (modalState.quantity > 1) {
        modalState.quantity--;
        if (elements.qtyInput) {
            elements.qtyInput.value = modalState.quantity;
        }
    }
}

function increaseQty() {
    if (modalState.quantity < modalState.maxQuantity) {
        modalState.quantity++;
        if (elements.qtyInput) {
            elements.qtyInput.value = modalState.quantity;
        }
    }
}

// Toggle Description
function toggleDescription() {
    const fullDesc = elements.descriptionFull;
    const btn = elements.expandBtn;

    if (!fullDesc || !btn) return;

    const isExpanded = fullDesc.classList.contains('is-expanded');

    fullDesc.classList.toggle('is-expanded');
    btn.classList.toggle('is-expanded');

    btn.innerHTML = isExpanded
        ? 'Vedi dettagli completi <i class="fas fa-chevron-down"></i>'
        : 'Nascondi dettagli <i class="fas fa-chevron-up"></i>';
}

// Add to Cart from Modal
async function addToCartFromModal() {
    const product = modalState.currentProduct;
    if (!product) return;

    // Show loading state
    elements.addToCartBtn.classList.add('is-loading');
    elements.addToCartBtn.disabled = true;
    const btnText = document.getElementById('pdmBtnText');
    const originalText = btnText.textContent;
    btnText.textContent = 'Aggiungendo...';

    try {
        const response = await fetch('/shop/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: product.id,
                quantity: modalState.quantity
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show success toast
            showToast('Prodotto aggiunto al carrello!');

            // Update cart badge
            if (typeof updateCartBadge === 'function') {
                updateCartBadge();
            }

            // Close modal after short delay
            setTimeout(() => {
                closeProductDetail();
            }, 1500);
        } else {
            alert(data.message || 'Errore durante l\'aggiunta al carrello');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Errore durante l\'aggiunta al carrello');
    } finally {
        // Remove loading state
        elements.addToCartBtn.classList.remove('is-loading');
        elements.addToCartBtn.disabled = false;
        btnText.textContent = originalText;
    }
}

// Show Toast
function showToast(message) {
    if (!elements.toast) return;

    const textEl = document.getElementById('pdmToastText');
    if (textEl) {
        textEl.textContent = message;
    }

    elements.toast.classList.add('is-visible');

    setTimeout(() => {
        elements.toast.classList.remove('is-visible');
    }, 3000);
}

// Open Size Guide (placeholder)
function openSizeGuide() {
    alert('Guida alle taglie:\n\nS: 2-3 anni\nM: 4-5 anni\nL: 6-7 anni\nXL: 8-9 anni');
}

// Focus Trap
function trapFocus() {
    const focusableElements = elements.container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    };

    modalState.focusTrap = handleTabKey;
    document.addEventListener('keydown', handleTabKey);
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initProductModal);
