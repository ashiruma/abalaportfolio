// js/auth.js - Authentication Module

const Auth = {
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async checkAuth() {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const isValid = await API.verifyToken();
      if (!isValid) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      this.logout();
      return false;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  setupUI() {
    const adminToggle = document.getElementById('adminToggle');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');

    if (this.isAuthenticated()) {
      // Show admin controls
      if (adminToggle) {
        adminToggle.style.display = 'block';
      }
      if (logoutBtn) {
        logoutBtn.style.display = 'block';
      }

      // Setup logout button
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to logout?')) {
            this.logout();
          }
        });
      }

      // Setup admin toggle
      if (adminToggle && adminPanel) {
        adminToggle.addEventListener('click', () => {
          adminPanel.classList.toggle('active');
        });
      }
    } else {
      // Hide admin controls
      if (adminToggle) {
        adminToggle.style.display = 'none';
      }
      if (logoutBtn) {
        logoutBtn.style.display = 'none';
      }
      if (adminPanel) {
        adminPanel.style.display = 'none';
      }
    }
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
};

// Make Auth available globally
if (typeof window !== 'undefined') {
  window.Auth = Auth;
}