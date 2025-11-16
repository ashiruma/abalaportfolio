// js/gallery.js - Gallery Module

const Gallery = {
  categoryNames: {
    shortfilms: 'Short Films',
    photography: 'Photography',
    behind: 'Behind the Scenes',
    commercials: 'Commercials',
    documentaries: 'Documentaries',
    music: 'Music'
  },

  categoryClasses: {
    shortfilms: 'shortfilms',
    photography: 'photography',
    behind: 'behind',
    commercials: 'commercials',
    documentaries: 'documentaries',
    music: 'music'
  },

  render(portfolioData) {
    const container = document.getElementById('categories');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(portfolioData).forEach(category => {
      const section = document.createElement('section');
      section.className = `category ${this.categoryClasses[category]}`;
      
      const count = portfolioData[category].length;
      const h2 = document.createElement('h2');
      h2.innerHTML = `${this.categoryNames[category]} <span class="count">(${count})</span>`;
      
      const gallery = document.createElement('div');
      gallery.className = 'gallery';
      gallery.dataset.category = category;
      
      if (portfolioData[category].length === 0) {
        gallery.classList.add('empty');
        gallery.textContent = 'No images yet';
      } else {
        portfolioData[category].forEach(item => {
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = item.title || this.categoryNames[category];
          img.dataset.imageId = item.id;
          img.dataset.category = category;
          
          // Add error handling for broken images
          img.onerror = function() {
            this.style.opacity = '0.3';
            this.style.filter = 'grayscale(100%)';
            this.title = 'Image failed to load';
          };
          
          gallery.appendChild(img);
        });
      }
      
      section.appendChild(h2);
      section.appendChild(gallery);
      container.appendChild(section);
    });

    // Attach lightbox listeners after rendering
    if (window.Lightbox) {
      window.Lightbox.attachListeners();
    }
  },

  async load() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
      if (loadingOverlay) {
        loadingOverlay.classList.add('active');
      }

      const portfolioData = await API.getPortfolio();
      this.render(portfolioData);
      
      return portfolioData;
    } catch (error) {
      console.error('Error loading portfolio:', error);
      this.showError('Failed to load portfolio. Please refresh the page.');
      throw error;
    } finally {
      if (loadingOverlay) {
        setTimeout(() => {
          loadingOverlay.classList.remove('active');
        }, 300);
      }
    }
  },

  showError(message) {
    const container = document.getElementById('categories');
    if (!container) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    errorDiv.style.maxWidth = '600px';
    errorDiv.style.margin = '2rem auto';
    
    container.innerHTML = '';
    container.appendChild(errorDiv);
  },

  async refresh() {
    await this.load();
  }
};

// Make Gallery available globally
if (typeof window !== 'undefined') {
  window.Gallery = Gallery;
}