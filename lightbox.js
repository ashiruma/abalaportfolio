// js/lightbox.js - Lightbox Module

const Lightbox = {
  lightbox: null,
  lightboxImg: null,
  closeBtn: null,
  nextBtn: null,
  prevBtn: null,
  allImages: [],
  currentIndex: 0,

  init() {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightboxImg');
    this.closeBtn = document.getElementById('closeBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.prevBtn = document.getElementById('prevBtn');

    if (!this.lightbox || !this.lightboxImg) {
      console.error('Lightbox elements not found');
      return;
    }

    this.setupEventListeners();
  },

  setupEventListeners() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Navigation buttons
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }

    // Click outside to close
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    });
  },

  attachListeners() {
    this.allImages = Array.from(document.querySelectorAll('.gallery img:not(.empty)'));
    
    this.allImages.forEach((img, index) => {
      img.addEventListener('click', () => this.show(index));
    });
  },

  show(index) {
    if (!this.allImages.length) return;

    this.currentIndex = index;
    this.lightboxImg.src = this.allImages[index].src;
    this.lightbox.classList.add('active');
    
    setTimeout(() => {
      this.lightboxImg.style.opacity = '1';
      this.lightboxImg.style.transform = 'scale(1)';
    }, 10);
  },

  close() {
    this.lightboxImg.style.opacity = '0';
    this.lightboxImg.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      this.lightbox.classList.remove('active');
    }, 300);
  },

  next() {
    if (!this.allImages.length) return;

    this.lightboxImg.style.opacity = '0';
    this.lightboxImg.style.transform = 'translateX(100px) scale(0.9)';
    
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.allImages.length;
      this.lightboxImg.src = this.allImages[this.currentIndex].src;
      this.lightboxImg.style.transform = 'translateX(-100px) scale(0.9)';
      
      setTimeout(() => {
        this.lightboxImg.style.opacity = '1';
        this.lightboxImg.style.transform = 'translateX(0) scale(1)';
      }, 10);
    }, 200);
  },

  prev() {
    if (!this.allImages.length) return;

    this.lightboxImg.style.opacity = '0';
    this.lightboxImg.style.transform = 'translateX(-100px) scale(0.9)';
    
    setTimeout(() => {
      this.currentIndex = (this.currentIndex - 1 + this.allImages.length) % this.allImages.length;
      this.lightboxImg.src = this.allImages[this.currentIndex].src;
      this.lightboxImg.style.transform = 'translateX(100px) scale(0.9)';
      
      setTimeout(() => {
        this.lightboxImg.style.opacity = '1';
        this.lightboxImg.style.transform = 'translateX(0) scale(1)';
      }, 10);
    }, 200);
  }
};

// Make Lightbox available globally
if (typeof window !== 'undefined') {
  window.Lightbox = Lightbox;
}