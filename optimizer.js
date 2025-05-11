export class PerformanceOptimizer {
  constructor() {
    this.observer = new IntersectionObserver(this.handleIntersection);
  }

  init() {
    document.querySelectorAll('[data-lazy]').forEach(img => {
      this.observer.observe(img);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        this.observer.unobserve(img);
      }
    });
  }
}
