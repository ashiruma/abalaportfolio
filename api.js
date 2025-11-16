// js/api.js - API Client Module

const API_URL = 'http://localhost:3000/api';

const API = {
  // Auth endpoints
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  async verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  },

  // Portfolio endpoints
  async getPortfolio() {
    try {
      const response = await fetch(`${API_URL}/portfolio`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  async addImage(category, url, title) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/portfolio/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ category, url, title })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add image');
    }

    return response.json();
  },

  async deleteImage(imageId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/portfolio/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete image');
    }

    return response.json();
  },

  async clearAllImages() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/portfolio/images`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clear images');
    }

    return response.json();
  },

  async getCounts() {
    try {
      const response = await fetch(`${API_URL}/portfolio/counts`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch counts');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching counts:', error);
      throw error;
    }
  }
};

// Make API available globally
if (typeof window !== 'undefined') {
  window.API = API;
  window.API_URL = API_URL;
}