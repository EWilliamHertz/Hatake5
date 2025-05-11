// In main.js
class AnalyticsManager {
  trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        'event_category': category,
        'event_label': label
      });
    }
  }

  init() {
    document.addEventListener('click', e => {
      if (e.target.closest('.add-to-cart')) {
        this.trackEvent('Cart', 'Add Item');
      }
    });
  }
}
// In main.js
class InventoryManager {
  constructor() {
    this.inventory = new Map();
  }

  async loadInventory() {
    const response = await fetch('/api/inventory');
    const data = await response.json();
    this.inventory = new Map(data);
    this.updateUI();
  }

  updateUI() {
    document.querySelectorAll('[data-inventory]').forEach(el => {
      const productId = el.dataset.productId;
      el.textContent = this.inventory.get(productId) || 0;
      el.classList.toggle('low-stock', this.inventory.get(productId) < 5);
    });
  }
}
// In main.js
class MobileMenu {
  constructor() {
    this.menu = document.querySelector('.mobile-menu');
    this.toggleBtn = document.querySelector('.menu-toggle');
  }

  init() {
    this.toggleBtn.addEventListener('click', this.toggleMenu.bind(this));
  }

  toggleMenu() {
    this.menu.classList.toggle('active');
    this.toggleBtn.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  }
}
import { CartManager } from './cart.js';
import { ThemeManager } from './theme.js';
import { ProductFilter } from './filters.js';
import { Lightbox } from './lightbox.js';

// Initialize Modules
const cartManager = new CartManager();
const themeManager = new ThemeManager();
const productFilter = new ProductFilter();
const lightbox = new Lightbox();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  cartManager.init();
  themeManager.init();
  productFilter.init();
  lightbox.init();
});

// Cart Module (cart.js)
export class CartManager {
  constructor() {
    this.key = 'hatakeCart';
    this.cart = JSON.parse(localStorage.getItem(this.key)) || [];
  }

  init() {
    this.updateCounter();
    document.addEventListener('click', this.handleCartActions.bind(this));
  }

  updateCounter() {
    const counter = document.querySelector('.cart-count');
    if (counter) {
      counter.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  }

  handleCartActions(e) {
    if (e.target.closest('.add-to-cart')) {
      const productCard = e.target.closest('.product-card');
      this.addToCart(productCard);
    }
  }

  addToCart(productCard) {
    const productId = productCard.dataset.id;
    const existing = this.cart.find(item => item.id === productId);
    
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        id: productId,
        quantity: 1,
        price: parseFloat(productCard.dataset.price),
        name: productCard.dataset.name
      });
    }
    
    this.persistCart();
    this.updateCounter();
  }

  persistCart() {
    localStorage.setItem(this.key, JSON.stringify(this.cart));
  }
}

// Theme Module (theme.js)
export class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'dark';
  }

  init() {
    document.documentElement.setAttribute('data-theme', this.theme);
    document.querySelector('.theme-toggle').addEventListener('click', this.toggleTheme.bind(this));
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }
}

// Product Filter Module (filters.js)
export class ProductFilter {
  init() {
    document.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', this.handleFilter.bind(this));
    });
  }

  handleFilter(e) {
    const products = Array.from(document.querySelectorAll('.product-card'));
    const category = document.getElementById('categoryFilter').value;
    const sort = document.getElementById('sortFilter').value;

    // Filter by category
    let filtered = category === 'all' 
      ? products 
      : products.filter(p => p.dataset.category === category);

    // Sort products
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price);
      const priceB = parseFloat(b.dataset.price);
      return sort === 'price-asc' ? priceA - priceB : priceB - priceA;
    });

    // Update grid
    const grid = document.querySelector('.product-grid');
    grid.innerHTML = '';
    filtered.forEach(p => grid.appendChild(p));
  }
}

// Lightbox Module (lightbox.js)
export class Lightbox {
  constructor() {
    this.images = new Map();
  }

  init() {
    document.querySelectorAll('.product-media').forEach(media => {
      const productId = media.closest('.product-card').dataset.id;
      this.images.set(productId, media.dataset.gallery.split(','));
      media.addEventListener('click', this.openLightbox.bind(this));
    });

    document.querySelector('.lightbox-close').addEventListener('click', this.close);
    document.addEventListener('keydown', this.handleKeys.bind(this));
  }

  openLightbox(e) {
    const productId = e.currentTarget.closest('.product-card').dataset.id;
    this.currentGallery = this.images.get(productId);
    this.currentIndex = 0;
    this.updateLightbox();
    document.querySelector('.lightbox').classList.add('active');
  }

  updateLightbox() {
    const lightboxImg = document.querySelector('.lightbox-image');
    lightboxImg.src = this.currentGallery[this.currentIndex];
  }

  handleKeys(e) {
    if (e.key === 'ArrowLeft') this.prevImage();
    if (e.key === 'ArrowRight') this.nextImage();
    if (e.key === 'Escape') this.close();
  }

  close() {
    document.querySelector('.lightbox').classList.remove('active');
  }

  prevImage() {
    this.currentIndex = this.currentIndex > 0 
      ? this.currentIndex - 1 
      : this.currentGallery.length - 1;
    this.updateLightbox();
  }

  nextImage() {
    this.currentIndex = this.currentIndex < this.currentGallery.length - 1 
      ? this.currentIndex + 1 
      : 0;
    this.updateLightbox();
  }
}
