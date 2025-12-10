/**
 * Product Detail Page JavaScript
 * Handles image zoom, quantity picker, add to cart, carousel, and more
 */

// Image Zoom Functionality
function initImageZoom() {
    const zoomContainer = document.getElementById('zoomContainer');
    const mainImage = document.getElementById('mainImage');
    const zoomLens = document.getElementById('zoomLens');
    const zoomResult = document.getElementById('zoomResult');

    if (!zoomContainer || !mainImage || !zoomLens || !zoomResult) return;

    let cx, cy;

    zoomContainer.addEventListener('mouseenter', function() {
        // Calculate zoom ratio
        cx = zoomResult.offsetWidth / zoomLens.offsetWidth;
        cy = zoomResult.offsetHeight / zoomLens.offsetHeight;

        // Set background image
        zoomResult.style.backgroundImage = `url('${mainImage.src}')`;
        zoomResult.style.backgroundSize = (mainImage.width * cx) + 'px ' + (mainImage.height * cy) + 'px';

        // Show zoom elements
        zoomLens.style.opacity = '1';
        zoomResult.style.display = 'block';
    });

    zoomContainer.addEventListener('mouseleave', function() {
        zoomLens.style.opacity = '0';
        zoomResult.style.display = 'none';
    });

    zoomContainer.addEventListener('mousemove', function(e) {
        const bounds = zoomContainer.getBoundingClientRect();

        // Calculate cursor position
        let x = e.clientX - bounds.left;
        let y = e.clientY - bounds.top;

        // Prevent lens from going outside image
        x = x - (zoomLens.offsetWidth / 2);
        y = y - (zoomLens.offsetHeight / 2);

        if (x > mainImage.width - zoomLens.offsetWidth) x = mainImage.width - zoomLens.offsetWidth;
        if (x < 0) x = 0;
        if (y > mainImage.height - zoomLens.offsetHeight) y = mainImage.height - zoomLens.offsetHeight;
        if (y < 0) y = 0;

        // Position lens
        zoomLens.style.left = x + 'px';
        zoomLens.style.top = y + 'px';

        // Display zoomed image
        zoomResult.style.backgroundPosition = '-' + (x * cx) + 'px -' + (y * cy) + 'px';
    });
}

// Change Main Image from Thumbnails
function changeImage(src, thumbnail) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = src;
    }

    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    if (thumbnail) {
        thumbnail.classList.add('active');
    }
}

// Quantity Picker Functions
function decreaseQuantity() {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value);
    if (value > 1) {
        input.value = value - 1;
    }
}

function increaseQuantity(maxStock) {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value);
    if (value < maxStock) {
        input.value = value + 1;
    }
}

// Add to Cart from Detail Page
async function addToCartDetail(productId) {
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value) || 1;

    try {
        const response = await fetch('/shop/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show success toast
            showToast('Prodotto aggiunto al carrello!');

            // Update cart badge if function exists
            if (typeof updateCartBadge === 'function') {
                updateCartBadge();
            }

            // Reset quantity to 1
            quantityInput.value = 1;

            // Optional: Update available stock display
            const stockElement = document.querySelector('.stock-status');
            if (stockElement && data.available_stock !== undefined) {
                updateStockDisplay(data.available_stock);
            }
        } else {
            alert(data.message || 'Errore durante l\'aggiunta al carrello');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Errore durante l\'aggiunta al carrello');
    }
}

// Quick Add from Related Products
async function quickAdd(productId) {
    try {
        const response = await fetch('/shop/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Prodotto aggiunto al carrello!');
            if (typeof updateCartBadge === 'function') {
                updateCartBadge();
            }
        } else {
            alert(data.message || 'Errore durante l\'aggiunta al carrello');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Errore durante l\'aggiunta al carrello');
    }
}

// Show Toast Notification
function showToast(message) {
    const toast = document.getElementById('addToCartToast');
    if (toast) {
        const messageSpan = toast.querySelector('span');
        if (messageSpan) {
            messageSpan.textContent = message;
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Update Stock Display
function updateStockDisplay(availableStock) {
    const stockElement = document.querySelector('.stock-status');
    if (!stockElement) return;

    // Remove all status classes
    stockElement.classList.remove('in-stock', 'low-stock', 'out-of-stock');

    // Update text and class based on stock
    if (availableStock > 5) {
        stockElement.classList.add('in-stock');
        stockElement.innerHTML = `<i class="fas fa-check-circle"></i> Disponibile (${availableStock} pezzi)`;
    } else if (availableStock > 0) {
        stockElement.classList.add('low-stock');
        stockElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> Solo ${availableStock} rimasti!`;
    } else {
        stockElement.classList.add('out-of-stock');
        stockElement.innerHTML = `<i class="fas fa-times-circle"></i> Esaurito`;

        // Disable add to cart button
        const addButton = document.querySelector('.btn-add-cart');
        if (addButton) {
            addButton.disabled = true;
        }

        // Disable quantity picker
        const qtyInput = document.getElementById('quantity');
        const qtyButtons = document.querySelectorAll('.qty-btn');
        if (qtyInput) qtyInput.disabled = true;
        qtyButtons.forEach(btn => btn.disabled = true);
    }

    // Update quantity input max
    const qtyInput = document.getElementById('quantity');
    if (qtyInput) {
        qtyInput.max = availableStock;
        if (parseInt(qtyInput.value) > availableStock) {
            qtyInput.value = availableStock > 0 ? availableStock : 1;
        }
    }
}

// Related Products Carousel
function scrollCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    const scrollAmount = 300;

    if (direction === 'next') {
        track.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    } else {
        track.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Size Selector
function selectSize(button) {
    // Remove active class from all
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active to clicked
    button.classList.add('active');
}

// Color Selector
function selectColor(button) {
    // Remove active class from all
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active to clicked
    button.classList.add('active');

    // Update color name display
    const colorName = button.dataset.color;
    const colorNameElement = document.querySelector('.color-name');
    if (colorNameElement && colorName) {
        colorNameElement.textContent = colorName;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize image zoom
    initImageZoom();

    // Add click listeners to size options
    document.querySelectorAll('.size-option:not(.disabled)').forEach(button => {
        button.addEventListener('click', function() {
            selectSize(this);
        });
    });

    // Add click listeners to color options
    document.querySelectorAll('.color-option').forEach(button => {
        button.addEventListener('click', function() {
            selectColor(this);
        });
    });

    // Smooth scroll for breadcrumbs
    document.querySelectorAll('.breadcrumbs a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Auto-hide carousel buttons if not enough items
    const track = document.getElementById('carouselTrack');
    if (track) {
        const checkCarouselButtons = () => {
            const prevBtn = document.querySelector('.carousel-btn.prev');
            const nextBtn = document.querySelector('.carousel-btn.next');

            if (track.scrollWidth <= track.clientWidth) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
            } else {
                if (prevBtn) prevBtn.style.display = 'flex';
                if (nextBtn) nextBtn.style.display = 'flex';
            }
        };

        checkCarouselButtons();
        window.addEventListener('resize', checkCarouselButtons);
    }
});

// Prevent zoom on mobile devices (can cause issues)
if ('ontouchstart' in window) {
    const zoomContainer = document.getElementById('zoomContainer');
    if (zoomContainer) {
        zoomContainer.style.cursor = 'default';
    }
}
