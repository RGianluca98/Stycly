// Stycly Main JavaScript

// Smooth scrolling and navigation
document.addEventListener('DOMContentLoaded', function() {
    // Hero Gallery Auto-Rotate
    initHeroGallery();

    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('show');
        });
    }
    
    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    // Close mobile menu if open
                    navMenu.classList.remove('show');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    
    // User dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
        
        // Fetch last insert time
        fetchLastInsertTime();
    }
    
    // Cart functionality
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', openCartModal);
        updateCartBadge();
    }
    
    // Search button - scroll to products and focus search
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            window.location.hash = 'products';
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
            }, 500);
        });
    }
    
    // Flash message close buttons
    document.querySelectorAll('.flash-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => this.parentElement.remove(), 300);
        });
    });
    
    // Auto-dismiss flash messages after 5 seconds
    setTimeout(() => {
        document.querySelectorAll('.flash').forEach(flash => {
            flash.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => flash.remove(), 300);
        });
    }, 5000);
    
    // Set min date for rental form
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    if (startDateInput && endDateInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.setAttribute('min', today);
        endDateInput.setAttribute('min', today);
        
        startDateInput.addEventListener('change', function() {
            endDateInput.setAttribute('min', this.value);
            if (endDateInput.value && endDateInput.value < this.value) {
                endDateInput.value = this.value;
            }
        });
    }
});

// Fetch last item insert time for user dropdown
function fetchLastInsertTime() {
    fetch('/api/user/last-insert')
        .then(res => res.json())
        .then(data => {
            const lastInsertInfo = document.getElementById('lastInsertInfo');
            if (lastInsertInfo) {
                if (data.last_insert) {
                    lastInsertInfo.innerHTML = `<i class="fas fa-clock"></i><span>Ultimo articolo aggiunto: ${data.last_insert}</span>`;
                } else {
                    lastInsertInfo.innerHTML = '<i class="fas fa-clock"></i><span>Nessun articolo aggiunto ancora</span>';
                }
            }
        })
        .catch(err => console.error('Error fetching last insert time:', err));
}

// Cart functions
function updateCartBadge() {
    fetch('/shop/cart/get')
        .then(res => res.json())
        .then(data => {
            const badge = document.getElementById('cartBadge');
            if (badge) {
                badge.textContent = data.total_items || 0;
                badge.style.display = data.total_items > 0 ? 'block' : 'none';
            }
        })
        .catch(err => console.error('Error updating cart badge:', err));
}

function openCartModal() {
    const modal = document.getElementById('cartModal');
    modal.classList.add('show');
    loadCartItems();
}

function closeCartModal() {
    const modal = document.getElementById('cartModal');
    modal.classList.remove('show');
}

function loadCartItems() {
    fetch('/shop/cart/get')
        .then(res => res.json())
        .then(data => {
            const cartItems = document.getElementById('cartItems');
            if (data.items && data.items.length > 0) {
                let html = '<div class="cart-items">';
                data.items.forEach(item => {
                    // image_path is already a full URL from url_for
                    const imgSrc = item.image_path || 'https://via.placeholder.com/80x80?text=No+Image';

                    html += `
                        <div class="cart-item">
                            <img src="${imgSrc}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                            <div class="cart-item-info">
                                <h4>${item.title}</h4>
                                <p>Taglia: ${item.size}</p>
                                ${item.age_range ? `<p>Età: ${item.age_range}</p>` : ''}
                            </div>
                            <div class="cart-item-controls">
                                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                });
                html += '</div>';
                cartItems.innerHTML = html;
            } else {
                cartItems.innerHTML = '<p style="text-align: center; padding: 2rem;">Il tuo carrello è vuoto</p>';
            }
        })
        .catch(err => console.error('Error loading cart:', err));
}

function updateCartQuantity(itemId, quantity) {
    fetch('/shop/cart/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({item_id: itemId, quantity: quantity})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadCartItems();
            updateCartBadge();
            // Reload products to update available stock
            if (typeof loadProducts === 'function') {
                loadProducts();
            }
        }
    })
    .catch(err => console.error('Error updating cart:', err));
}

function removeFromCart(itemId) {
    fetch('/shop/cart/remove', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({item_id: itemId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadCartItems();
            updateCartBadge();
            // Reload products to update available stock
            if (typeof loadProducts === 'function') {
                loadProducts();
            }
        }
    })
    .catch(err => console.error('Error removing from cart:', err));
}

function proceedToRental() {
    closeCartModal();

    // Show the rental section
    const rentalSection = document.getElementById('rental-request');
    if (rentalSection) {
        rentalSection.style.display = 'block';

        // Populate order summary
        populateOrderSummary();

        // Scroll to the section
        setTimeout(() => {
            rentalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function populateOrderSummary() {
    fetch('/shop/cart/get')
        .then(res => res.json())
        .then(data => {
            console.log('Cart data received:', data);

            const summaryContainer = document.getElementById('order-summary-items');
            if (!summaryContainer) {
                console.error('Summary container not found!');
                return;
            }

            if (!data.items || data.items.length === 0) {
                summaryContainer.innerHTML = '<p class="no-items">Nessun articolo nel carrello</p>';
                return;
            }

            let html = '';
            data.items.forEach(item => {
                console.log('Processing item:', item);
                console.log('Image path:', item.image_path);

                // Use first image or fallback
                const imgSrc = item.image_path || 'https://via.placeholder.com/60x60?text=No+Image';

                html += `
                    <div class="order-summary-item">
                        <img src="${imgSrc}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'; console.error('Image failed to load:', '${imgSrc}');">
                        <div class="order-summary-item-info">
                            <h4>${item.title}</h4>
                            <p>Taglia: ${item.size}</p>
                            ${item.age_range ? `<p>Età: ${item.age_range}</p>` : ''}
                        </div>
                        <div class="order-summary-item-quantity">x${item.quantity}</div>
                    </div>
                `;
            });

            summaryContainer.innerHTML = html;
            console.log('Order summary HTML set');
        })
        .catch(err => console.error('Error loading order summary:', err));
}

// Add event listener to update dates in summary when changed
document.addEventListener('DOMContentLoaded', function() {
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    const summaryDates = document.getElementById('summary-dates');

    function updateSummaryDates() {
        const startDate = startDateInput?.value;
        const endDate = endDateInput?.value;

        if (startDate && endDate && summaryDates) {
            const start = new Date(startDate).toLocaleDateString('it-IT');
            const end = new Date(endDate).toLocaleDateString('it-IT');
            summaryDates.textContent = `${start} - ${end}`;
        } else if (summaryDates) {
            summaryDates.textContent = 'Da selezionare';
        }
    }

    if (startDateInput) {
        startDateInput.addEventListener('change', updateSummaryDates);
    }
    if (endDateInput) {
        endDateInput.addEventListener('change', updateSummaryDates);
    }
});

// Wardrobe functions
function confirmDeleteWardrobe() {
    if (confirm('Sei sicuro di voler eliminare tutti gli articoli dal tuo guardaroba? Questa azione non può essere annullata.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/wardrobe/delete-all';
        document.body.appendChild(form);
        form.submit();
    }
}

function confirmDeleteAccount() {
    if (confirm('Sei sicuro di voler eliminare il tuo account? Questo eliminerà definitivamente tutti i tuoi dati, inclusi gli articoli del guardaroba e la cronologia degli ordini. Questa azione non può essere annullata.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/wardrobe/delete-account';
        document.body.appendChild(form);
        form.submit();
    }
}

function toggleAddItemForm() {
    const form = document.getElementById('addItemForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('cartModal');
    if (e.target === modal) {
        closeCartModal();
    }
});

// Hero Gallery Auto-Rotate Function
function initHeroGallery() {
    const slides = document.querySelectorAll('.gallery-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    function showNextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');

        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;

        // Add active class to next slide
        slides[currentSlide].classList.add('active');
    }

    // Auto-rotate every 4 seconds
    setInterval(showNextSlide, 4000);
}
