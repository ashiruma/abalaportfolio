// js/main.js - Main Application Entry Point

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize modules
  Auth.setupUI();
  Lightbox.init();

  // Load portfolio data
  try {
    await Gallery.load();
  } catch (error) {
    console.error('Failed to initialize portfolio:', error);
  }

  // Setup admin form if user is authenticated
  if (Auth.isAuthenticated()) {
    setupAdminForm();
  }
});

function setupAdminForm() {
  const addImageForm = document.getElementById('addImageForm');
  const addImageBtn = document.getElementById('addImageBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const formError = document.getElementById('formError');

  if (!addImageForm) return;

  // Add image form submission
  addImageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const category = document.getElementById('categorySelect').value;
    const url = document.getElementById('imageUrl').value.trim();
    const title = document.getElementById('imageTitle').value.trim();

    // Clear previous errors
    formError.textContent = '';
    formError.classList.remove('show');

    // Validation
    if (!category) {
      showFormError('Please select a category');
      return;
    }

    if (!url) {
      showFormError('Please enter an image URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      showFormError('Please enter a valid URL');
      return;
    }

    // Show loading state
    addImageBtn.classList.add('loading');
    addImageBtn.disabled = true;

    try {
      await API.addImage(category, url, title);
      
      // Clear form
      document.getElementById('categorySelect').value = '';
      document.getElementById('imageUrl').value = '';
      document.getElementById('imageTitle').value = '';

      // Refresh gallery
      await Gallery.refresh();

      // Show success feedback
      showFormSuccess('Image added successfully!');
    } catch (error) {
      console.error('Error adding image:', error);
      showFormError(error.message || 'Failed to add image');
    } finally {
      addImageBtn.classList.remove('loading');
      addImageBtn.disabled = false;
    }
  });

  // Clear all images
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to clear all images? This action cannot be undone.')) {
        return;
      }

      clearAllBtn.classList.add('loading');
      clearAllBtn.disabled = true;

      try {
        await API.clearAllImages();
        await Gallery.refresh();
        showFormSuccess('All images cleared successfully!');
      } catch (error) {
        console.error('Error clearing images:', error);
        showFormError(error.message || 'Failed to clear images');
      } finally {
        clearAllBtn.classList.remove('loading');
        clearAllBtn.disabled = false;
      }
    });
  }
}

function showFormError(message) {
  const formError = document.getElementById('formError');
  if (!formError) return;

  formError.textContent = message;
  formError.classList.add('show');
  formError.style.background = '#ffebee';
  formError.style.color = '#c62828';

  setTimeout(() => {
    formError.classList.remove('show');
  }, 5000);
}

function showFormSuccess(message) {
  const formError = document.getElementById('formError');
  if (!formError) return;

  formError.textContent = message;
  formError.classList.add('show');
  formError.style.background = '#e8f5e9';
  formError.style.color = '#2e7d32';

  setTimeout(() => {
    formError.classList.remove('show');
  }, 3000);
}

// Handle network errors globally
window.addEventListener('online', () => {
  console.log('Connection restored');
  Gallery.refresh();
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  showFormError('You are currently offline. Changes may not be saved.');
});