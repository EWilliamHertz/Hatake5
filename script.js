window.addEventListener('scroll', () => {
    document.querySelector('header').classList.toggle('scrolled', window.scrollY > 50);
    const backToTop = document.querySelector('.back-to-top');
    const stickyCta = document.querySelector('.sticky-cta');
    if (backToTop) backToTop.style.display = window.scrollY > 200 ? 'block' : 'none';
    if (stickyCta) stickyCta.style.display = window.scrollY > 200 ? 'block' : 'none';
});

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
} else {
    darkModeToggle.textContent = '🌙';
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});


const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');
const productGrid = document.querySelector('.product-grid');
const products = Array.from(document.querySelectorAll('.product-card'));

function filterProducts() {
    if (!productGrid || !products.length) return;

    let filteredProducts = products;

    const category = categoryFilter ? categoryFilter.value : 'all';
    if (category !== 'all') {
        filteredProducts = products.filter(product => product.dataset.category === category);
    }

    const sort = sortFilter ? sortFilter.value : 'default';
    if (sort !== 'default') {
        filteredProducts = filteredProducts.sort((a, b) => {
            const priceA = parseFloat(a.dataset.price);
            const priceB = parseFloat(b.dataset.price);
            return sort === 'price-low' ? priceA - priceB : priceB - priceA;
        });
    }

    productGrid.style.display = 'none';
    productGrid.innerHTML = '';
    filteredProducts.forEach(product => productGrid.appendChild(product));
    productGrid.style.display = 'grid';

    if (category === 'all' && sort === 'default') {
        products.forEach(product => productGrid.appendChild(product));
    }
}

if (categoryFilter && sortFilter) {
    categoryFilter.addEventListener('change', filterProducts);
    sortFilter.addEventListener('change', filterProducts);
}

const eventTypeFilter = document.getElementById('event-type-filter');
const eventRegionFilter = document.getElementById('event-region-filter');
const eventGrid = document.querySelector('.event-grid');
const events = Array.from(document.querySelectorAll('.event-card'));

function filterEvents() {
    if (!eventGrid || !events.length) return;

    let filteredEvents = events;

    const type = eventTypeFilter ? eventTypeFilter.value : 'all';
    if (type !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.dataset.type === type);
    }

    const region = eventRegionFilter ? eventRegionFilter.value : 'all';
    if (region !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.dataset.region === region);
    }

    eventGrid.style.display = 'none';
    eventGrid.innerHTML = '';
    filteredEvents.forEach(event => eventGrid.appendChild(event));
    eventGrid.style.display = 'grid';

    if (type === 'all' && region === 'all') {
        events.forEach(event => eventGrid.appendChild(event));
    }
}

if (eventTypeFilter && eventRegionFilter) {
    eventTypeFilter.addEventListener('change', filterEvents);
    eventRegionFilter.addEventListener('change', filterEvents);
}

let cart = [];
const exchangeRates = { USD: 1, SEK: 10.5, EUR: 0.95 };

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    const selectedCurrency = document.getElementById('currency-switcher').value;
    cartItemsDiv.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        const priceInCurrency = (item.price * exchangeRates[selectedCurrency]).toFixed(2);
        itemDiv.innerHTML = `
            <span>${item.name} - ${selectedCurrency} ${priceInCurrency}</span>
            <select onchange="updateCartItem(${index}, this.value)">
                ${[...Array(10).keys()].map(i => `<option value="${i + 1}" ${item.quantity == i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}
            </select>
            <button class="remove-button" data-index="${index}">Remove</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
        total += priceInCurrency * item.quantity;

        itemDiv.querySelector('.remove-button').addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            cart.splice(index, 1);
            updateCartDisplay();
        });
    });

    cartTotalDiv.textContent = `Total: ${selectedCurrency} ${total.toFixed(2)}`;
    document.getElementById('cart-data').value = JSON.stringify(cart);
}

function updateCartItem(index, quantity) {
    cart[index].quantity = parseInt(quantity);
    updateCartDisplay();
}

document.querySelectorAll('.cart-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = button.closest('.product-card');
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price);
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        updateCartDisplay();
    });
});

const currencySwitcher = document.getElementById('currency-switcher');

function updatePrices(currency) {
    document.querySelectorAll('.product-card').forEach(card => {
        const basePrice = parseFloat(card.dataset.price);
        const newPrice = (basePrice * exchangeRates[currency]).toFixed(2);
        card.querySelector('.price').textContent = `${currency} ${newPrice}`;
    });
    updateCartDisplay();
}

currencySwitcher.addEventListener('change', (e) => {
    const selectedCurrency = e.target.value;
    updatePrices(selectedCurrency);
});

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function updateWishlistDisplay() {
    const wishlistGrid = document.getElementById('wishlist-grid');
    wishlistGrid.innerHTML = '';

    wishlist.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const selectedCurrency = document.getElementById('currency-switcher').value;
        const priceInCurrency = (item.price * exchangeRates[selectedCurrency]).toFixed(2);
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="product-image" loading="lazy">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="price">${selectedCurrency} ${priceInCurrency}</div>
            <button class="cart-button">Add to Cart</button>
            <button class="delete-button" data-index="${index}">Delete</button>
        `;
        wishlistGrid.appendChild(card);

        card.querySelector('.cart-button').addEventListener('click', (e) => {
            e.stopPropagation();
            const existingItem = cart.find(cartItem => cartItem.name === item.name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name: item.name, price: parseFloat(item.price), quantity: 1 });
            }
            wishlist = wishlist.filter(wishItem => wishItem.name !== item.name);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlistDisplay();
            updateCartDisplay();
        });

        card.querySelector('.delete-button').addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            wishlist.splice(index, 1);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlistDisplay();
        });
    });
}

document.querySelectorAll('.wishlist-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = button.closest('.product-card');
        const name = card.dataset.name;
        const price = card.dataset.price;
        const image = card.querySelector('.product-image').src;
        const description = card.querySelector('p').textContent;

        if (!wishlist.some(item => item.name === name)) {
            wishlist.push({ name, price, image, description });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlistDisplay();
        }
    });
});

updateWishlistDisplay();

function startCountdown() {
    document.querySelectorAll('.product-card').forEach(card => {
        const releaseDate = new Date(card.dataset.releaseDate + 'T00:00:00');
        const timerElement = card.querySelector('.countdown-timer');

        function updateTimer() {
            const now = new Date();
            const timeDiff = releaseDate - now;

            if (timeDiff <= 0) {
                timerElement.textContent = 'Available Now!';
                return;
            }

            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            timerElement.textContent = `Available in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        updateTimer();
        setInterval(updateTimer, 1000);
    });
}

startCountdown();

const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.gallery-image');
const lightboxDescription = document.getElementById('lightbox-description');
const closeLightbox = lightbox.querySelector('.close');

const productImages = {
    'Duffel Bag': ['/images/IMG_2740.jpeg', '/images/IMG_2801.webp', '/images/IMG_2802.jpeg'],
    '25x 35pt Top-Loaders': ['/images/IMG_9971.jpg', '/images/IMG_9970.jpg', '/images/IMG_9972.jpg', '/images/IMG_9973.jpg', '/images/IMG_9974.jpg', '/images/IMG_9975.jpg', '/images/IMG_9976.jpg', '/images/IMG_9978.jpg'],
    '10x 130pt Top-Loaders': ['/images/IMG_9979.jpg', '/images/IMG_9980.jpg', '/images/IMG_9981.jpg', '/images/IMG_9982.jpg', '/images/IMG_9983.jpg', '/images/IMG_9984.jpg', '/images/IMG_9985.jpg', '/images/IMG_9986.jpg', '/images/IMG_9987.jpg'],
    'Matte Sleeves': ['/images/IMG_9960.jpg', '/images/IMG_9968.jpg', '/images/IMG_9952.jpg', '/images/IMG_9954.jpg', '/images/IMG_9956.jpg', '/images/IMG_9957.jpg', '/images/IMG_9958.jpg', '/images/IMG_9962.jpg', '/images/IMG_9963.jpg', '/images/IMG_9965.jpg'],
    'PU DeckBox': ['/images/IMG_9924.jpg', '/images/IMG_9895.jpg', '/images/IMG_9899.jpg', '/images/IMG_9900.jpg', '/images/IMG_9901.jpg', '/images/IMG_9903.jpg', '/images/IMG_9904.jpg', '/images/IMG_9912.jpg', '/images/IMG_9941.jpg', '/images/IMG_9943.jpg', '/images/IMG_9947.jpg', '/images/IMG_9948.jpg', '/images/IMG_9949.jpg', '/images/IMG_9951.jpg'],
    '480-Slot Binder': ['/images/IMG_9814.jpg', '/images/IMG_9839.jpg', '/images/IMG_9818.jpg', '/images/IMG_9816.jpg', '/images/IMG_9819.jpg', '/images/IMG_9820.jpg', '/images/IMG_9823.jpg', '/images/IMG_9824.jpg', '/images/IMG_9825.jpg', '/images/IMG_9826.jpg']
};


let currentImageIndex = 0;
let productName = '';

document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
        productName = card.dataset.name;
        const images = productImages[productName];
        if (!images || images.length === 0) {
            alert('No additional images available for this product.');
            return;
        }

        currentImageIndex = 0;
        lightboxImg.src = images[currentImageIndex];
        const thumbnailGallery = lightbox.querySelector('.thumbnail-gallery');
        thumbnailGallery.innerHTML = images.map((img, index) => `
            <img src="${img}" alt="${productName} Thumbnail ${index + 1}" class="thumbnail" data-index="${index}" ${index === 0 ? 'class="thumbnail active"' : ''}>
        `).join('');
        lightboxDescription.textContent = productDescriptions[productName] || 'No description available.';
        lightbox.style.display = 'flex';

        const prevButton = lightbox.querySelector('.gallery-prev');
        const nextButton = lightbox.querySelector('.gallery-next');
        const thumbnails = thumbnailGallery.querySelectorAll('.thumbnail');

        prevButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : images.length - 1;
            updateGallery();
        });

        nextButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex < images.length - 1) ? currentImageIndex + 1 : 0;
            updateGallery();
        });

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                currentImageIndex = parseInt(thumb.getAttribute('data-index'));
                updateGallery();
            });
        });
    });
});

function updateGallery() {
    const images = [productName];
    lightboxImg.src = images[currentImageIndex];
    const thumbnails = lightbox.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (parseInt(thumb.getAttribute('data-index')) === currentImageIndex) {
            thumb.classList.add('active');
        }
    });
}

if (closeLightbox) {
    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });
}

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
    }
});

const productDescriptions = {
    'Duffel Bag': 'This tournament-ready duffel bag measures 47*28*55cm, offering ample space for your TCG gear. Crafted with durable materials, it features multiple compartments for decks, binders, and accessories, ensuring you’re always prepared for your next event.',
    '25x 35pt Top-Loaders': 'A pack of 25 35pt top-loaders designed for standard-sized trading cards. These top-loaders provide excellent protection against bends and scratches, keeping your cards in pristine condition during storage or transport.',
    '10x 130pt Top-Loaders': 'A pack of 10 130pt top-loaders, perfect for the playsets you wanna keep safe.. These sturdy top-loaders offer superior protection, ensuring your valuable cards remain safe and secure.',
    'Matte Sleeves': 'A pack of 100 premium black matte sleeves (66x91mm), designed to fit standard-sized trading cards. These sleeves offer a non-glare finish, making them ideal for both casual play and competitive tournaments.',
    'PU DeckBox': 'This PU DeckBox holds 160+ cards and features a magnetic closure for secure storage. Its multi-functional design includes compartments for dice and accessories, making it a must-have for any TCG player.',
    '480-Slot Binder': 'A premium zippered binder with 480 slots and side-loading pockets. Designed to keep your collection organized and protected, this binder is perfect for showcasing your cards while ensuring they remain in mint condition.'
};

const preorderForm = document.getElementById('preorder-form');
const confirmationMessage = document.getElementById('confirmation-message');

preorderForm.addEventListener('submit', (e) => {
    setTimeout(() => {
        confirmationMessage.style.display = 'block';
        cart = [];
        updateCartDisplay();
        preorderForm.reset();
        setTimeout(() => {
            confirmationMessage.style.display = 'none';
        }, 5000);
    }, 1000);
});

const partnerForm = document.getElementById('partner-form');
const partnerConfirmationMessage = document.getElementById('partner-confirmation-message');

if (partnerForm) {
    partnerForm.addEventListener('submit', (e) => {
        setTimeout(() => {
            partnerConfirmationMessage.style.display = 'block';
            partnerForm.reset();
            setTimeout(() => {
                partnerConfirmationMessage.style.display = 'none';
            }, 5000);
        }, 1000);
    });
}

document.querySelectorAll('.product-card').forEach(card => {
    const stock = parseInt(card.dataset.stock);
    const stockIndicator = card.querySelector('.stock-indicator');
    if (stock <= 0) {
        stockIndicator.textContent = 'Preorder Sold Out';
        stockIndicator.classList.add('sold-out');
        card.querySelector('.cart-button').disabled = true;
        card.querySelector('.wishlist-button').disabled = true;
    }
});

updatePrices('USD');
