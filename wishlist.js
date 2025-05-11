export class WishlistManager {
  constructor() {
    this.key = 'hatakeWishlist';
    this.wishlist = JSON.parse(localStorage.getItem(this.key)) || [];
  }

  init() {
    document.addEventListener('click', this.handleWishlistActions.bind(this));
    this.renderBadges();
  }

  toggleItem(productId) {
    const index = this.wishlist.indexOf(productId);
    index === -1 ? this.wishlist.push(productId) : this.wishlist.splice(index, 1);
    this.persist();
    this.renderBadges();
  }

  persist() {
    localStorage.setItem(this.key, JSON.stringify(this.wishlist));
  }

  renderBadges() {
    document.querySelectorAll('[data-wishlist-badge]').forEach(badge => {
      const productId = badge.closest('.product-card').dataset.id;
      badge.classList.toggle('active', this.wishlist.includes(productId));
    });
  }

  handleWishlistActions(e) {
    if (e.target.closest('.wishlist-btn')) {
      const productId = e.target.closest('.product-card').dataset.id;
      this.toggleItem(productId);
    }
  }
}
