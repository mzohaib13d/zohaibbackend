// Dashboard functionality for product management
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
let productForm;
let createProductForm;
let productsContainer;
document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    if (
      (e.ctrlKey && e.shiftKey && (key === "i" || key === "j")) || 
      (e.ctrlKey && key === "u") || 
      key === "f12"                 
    ) {
      e.preventDefault();
    }
  });
// Initialize dashboard
const initDashboard = () => {
    productForm = document.getElementById('productForm');
    createProductForm = document.getElementById('createProductForm');
    productsContainer = document.getElementById('productsContainer');
    
    console.log('Dashboard initialized');
    
    // Load user profile and products
    loadUserProfile();
    loadProducts();
    
    // Setup event listeners
    if (createProductForm) {
        createProductForm.addEventListener('submit', handleCreateProduct);
    }
};

// Load user profile
const loadUserProfile = async () => {
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('User profile loaded:', data);
            
            // Update welcome message
            const welcomeElement = document.querySelector('.dashboard-header h1');
            if (welcomeElement && data.user) {
                welcomeElement.textContent = `Welcome, ${data.user.name}!`;
            }
        } else if (response.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = '/pages/login.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = '/pages/login.html';
    }
};

// Product form functions - FIXED VERSION
window.showProductForm = () => {
    if (productForm) {
        productForm.classList.remove('hidden');
        console.log('Product form shown');
    }
};

window.hideProductForm = () => {
    if (productForm) {
        productForm.classList.add('hidden');
        console.log('Product form hidden');
    }
};

// New function: Explicitly show form for creating (when Add New Product button is clicked)
window.showCreateProductForm = () => {
    switchToCreateMode();
    showProductForm();
};

// Switch to create mode (only when explicitly needed)
const switchToCreateMode = () => {
    const formTitle = productForm?.querySelector('h3');
    const submitBtn = createProductForm?.querySelector('button[type="submit"]');
    
    if (formTitle) formTitle.textContent = 'Add New Product';
    if (submitBtn) submitBtn.textContent = 'Create Product';
    
    // Reset form only when switching to create mode
    createProductForm.reset();
    
    // Remove previous event listeners and add create listener
    const newForm = createProductForm.cloneNode(true);
    createProductForm.parentNode.replaceChild(newForm, createProductForm);
    createProductForm = newForm;
    
    createProductForm.addEventListener('submit', handleCreateProduct);
    delete createProductForm.dataset.editId;
    
    console.log('Switched to CREATE mode');
};

// Create new product
const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(createProductForm);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category')
    };
    
    // Validation
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
        alert('Please fill in all fields');
        return;
    }
    
    if (productData.price <= 0) {
        alert('Price must be greater than 0');
        return;
    }
    
    try {
        const submitBtn = createProductForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<div class="spinner"></div> Creating...';
        submitBtn.disabled = true;
        
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Success
            alert('Product created successfully!');
            hideProductForm();
            loadProducts(); // Refresh the products list
            // Ensure we're in create mode for next time
            switchToCreateMode();
        } else {
            throw new Error(data.message || 'Failed to create product');
        }
        
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Error creating product: ' + error.message);
    } finally {
        const submitBtn = createProductForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Create Product';
            submitBtn.disabled = false;
        }
    }
};

// Load products
window.loadProducts = async () => {
    try {
        if (productsContainer) {
            productsContainer.innerHTML = '<p>Loading products...</p>';
        }
        
        const response = await fetch(`${API_BASE}/products`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        const data = await response.json();
        
        if (data.success && productsContainer) {
            displayProducts(data.products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        if (productsContainer) {
            productsContainer.innerHTML = '<p class="error-message">Error loading products. Please try again.</p>';
        }
    }
};

// Display products
const displayProducts = (products) => {
    if (!productsContainer) return;
    
    // Debug: Check what data we're receiving
    console.log('Products data:', products);
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <p>No products found. Create your first product!</p>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = products.map(product => {
        console.log('Individual product:', product);
        return `
        <div class="product-card" data-product-id="${product._id}">
            <div class="product-header">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-price">$${product.price}</span>
            </div>
            <span class="product-category">${product.category}</span>
            <p class="product-description">${product.description}</p>
            <div class="product-meta">
                <span>Created: ${new Date(product.createdAt).toLocaleDateString()}</span>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="editProduct('${product._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')">Delete</button>
                </div>
            </div>
        </div>
    `}).join('');
};

// EDIT PRODUCT FUNCTION - FIXED FOR FIRST CLICK
window.editProduct = async (productId) => {
    console.log('=== EDIT PRODUCT STARTED ===');
    console.log('Product ID to edit:', productId);
    
    // Check if we're already editing this product
    if (createProductForm.dataset.editId === productId && !productForm.classList.contains('hidden')) {
        console.log('Already editing this product, form should be visible with data');
        return; // Form is already open with this product's data
    }
    
    try {
        // Method 1: Try to get product data from the DOM first (most reliable)
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        
        if (productCard) {
            console.log('Found product card in DOM');
            
            // Extract data from the visible product card
            const productName = productCard.querySelector('.product-name')?.textContent || '';
            const productPriceText = productCard.querySelector('.product-price')?.textContent || '0';
            const productPrice = parseFloat(productPriceText.replace('$', '')) || 0;
            const productCategory = productCard.querySelector('.product-category')?.textContent || '';
            const productDescription = productCard.querySelector('.product-description')?.textContent || '';
            
            console.log('Extracted from DOM:', {
                productName,
                productPrice,
                productCategory,
                productDescription
            });
            
            // Fill the form with extracted data FIRST
            fillProductForm(productName, productDescription, productPrice, productCategory, productId);
            
            // THEN show the form (this order is important)
            showProductForm();
            
        } else {
            // Method 2: If DOM method fails, try API method
            console.log('Product card not found in DOM, trying API...');
            await editProductFromAPI(productId);
        }
        
    } catch (error) {
        console.error('Error in editProduct:', error);
        alert('Error loading product for editing. Please check console for details.');
    }
};

// Helper function to fill the form (without showing it)
const fillProductForm = (name, description, price, category, productId) => {
    console.log('Filling form with:', { name, description, price, category, productId });
    
    // Fill form fields
    const nameField = document.getElementById('productName');
    const descField = document.getElementById('productDescription');
    const priceField = document.getElementById('productPrice');
    const categoryField = document.getElementById('productCategory');
    
    if (nameField) nameField.value = name || '';
    if (descField) descField.value = description || '';
    if (priceField) priceField.value = price || '';
    if (categoryField) categoryField.value = category || '';
    
    // Change to edit mode (but don't show form yet - let editProduct handle that)
    switchToEditMode(productId);
    
    console.log('Form filled with product data');
};

// API-based edit function
const editProductFromAPI = async (productId) => {
    try {
        console.log('Fetching product data from API...');
        
        const response = await fetch(`${API_BASE}/products`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (!data.success || !data.products) {
            throw new Error('Invalid API response format');
        }
        
        // Find the specific product
        const product = data.products.find(p => p._id === productId);
        
        if (!product) {
            throw new Error(`Product with ID ${productId} not found in API response`);
        }
        
        console.log('Found product via API:', product);
        
        // Fill form with API data FIRST
        fillProductForm(
            product.name,
            product.description,
            product.price,
            product.category,
            productId
        );
        
        // THEN show the form
        showProductForm();
        
    } catch (error) {
        console.error('Error in editProductFromAPI:', error);
        alert('Failed to load product data from server. Please try again.');
    }
};

// Switch form to edit mode
const switchToEditMode = (productId) => {
    const formTitle = productForm?.querySelector('h3');
    const submitBtn = createProductForm?.querySelector('button[type="submit"]');
    
    if (formTitle) formTitle.textContent = 'Edit Product';
    if (submitBtn) submitBtn.textContent = 'Update Product';
    
    // Remove previous event listeners
    const newForm = createProductForm.cloneNode(true);
    createProductForm.parentNode.replaceChild(newForm, createProductForm);
    createProductForm = newForm;
    
    // Add update event listener
    createProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUpdateProduct(e, productId);
    });
    
    // Store product ID
    createProductForm.dataset.editId = productId;
    
    console.log('Switched to edit mode for product:', productId);
};

// Update product handler
const handleUpdateProduct = async (e, productId) => {
    e.preventDefault();
    console.log('Updating product:', productId);
    
    const formData = new FormData(createProductForm);
    const productData = {
        name: formData.get('name') || '',
        description: formData.get('description') || '',
        price: parseFloat(formData.get('price')) || 0,
        category: formData.get('category') || ''
    };
    
    console.log('Update data:', productData);
    
    // Validation
    if (!productData.name.trim()) {
        alert('Product name is required');
        return;
    }
    
    if (!productData.description.trim()) {
        alert('Product description is required');
        return;
    }
    
    if (productData.price <= 0) {
        alert('Price must be greater than 0');
        return;
    }
    
    if (!productData.category) {
        alert('Please select a category');
        return;
    }
    
    try {
        const submitBtn = createProductForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<div class="spinner"></div> Updating...';
        submitBtn.disabled = true;
        
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        console.log('Update response:', data);
        
        if (response.ok && data.success) {
            alert('✅ Product updated successfully!');
            hideProductForm();
            loadProducts();
            // Reset to create mode after successful update
            switchToCreateMode();
        } else {
            throw new Error(data.message || 'Failed to update product');
        }
        
    } catch (error) {
        console.error('Update error:', error);
        alert('❌ Error updating product: ' + error.message);
    } finally {
        const submitBtn = createProductForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Update Product';
            submitBtn.disabled = false;
        }
    }
};

// Delete product
window.deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Product deleted successfully!');
            loadProducts(); // Refresh the list
        } else {
            throw new Error(data.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
    }
};

// Logout function
window.logout = async () => {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        window.location.href = '/index.html';
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);