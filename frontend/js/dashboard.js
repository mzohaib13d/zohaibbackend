// Dashboard functionality for product management
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
let productForm;
let createProductForm;
let productsContainer;

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

// Product form functions
window.showProductForm = () => {
    if (productForm) {
        productForm.classList.remove('hidden');
        // Clear form
        createProductForm.reset();
    }
};

window.hideProductForm = () => {
    if (productForm) {
        productForm.classList.add('hidden');
    }
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
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <p>No products found. Create your first product!</p>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = products.map(product => `
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
    `).join('');
};

// Edit product
window.editProduct = async (productId) => {
    try {
        // First get product details
        const response = await fetch(`${API_BASE}/products`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to load products');
        
        const data = await response.json();
        const product = data.products.find(p => p._id === productId);
        
        if (!product) {
            alert('Product not found');
            return;
        }
        
        // Prefill form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        
        // Show form and change to update mode
        showProductForm();
        
        // Change form to update mode
        const formTitle = productForm.querySelector('h3');
        const submitBtn = createProductForm.querySelector('button[type="submit"]');
        
        if (formTitle) formTitle.textContent = 'Edit Product';
        if (submitBtn) submitBtn.textContent = 'Update Product';
        
        // Store product ID for update
        createProductForm.dataset.editId = productId;
        
    } catch (error) {
        console.error('Error editing product:', error);
        alert('Error loading product details');
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