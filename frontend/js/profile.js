// API Base URL
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const profileContent = document.getElementById('profileContent');
const errorMessage = document.getElementById('errorMessage');

// Utility Functions
const showLoading = () => {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    profileContent.classList.add('hidden');
};

const showError = (message) => {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    profileContent.classList.add('hidden');
    errorMessage.textContent = message;
};

const showProfile = () => {
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    profileContent.classList.remove('hidden');
};

// Format date
const formatDate = (dateString) => {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Get user initials for avatar
const getUserInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
};

// API Call with error handling
const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            ...options
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Please login again to access your profile');
            }
            if (response.status === 404) {
                throw new Error('Profile not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Load user profile
const loadProfile = async () => {
    showLoading();
    
    try {
        // Get user profile
        const profileData = await apiCall(`${API_BASE}/profile`);
        
        if (profileData.success) {
            displayProfile(profileData.user);
            
            // Load additional user statistics
            await loadUserStatistics(profileData.user.id);
        } else {
            throw new Error(profileData.message || 'Failed to load profile');
        }
    } catch (error) {
        showError(error.message);
    }
};

// Display profile data
const displayProfile = (user) => {
    // Update avatar
    const avatar = document.getElementById('userAvatar');
    avatar.textContent = getUserInitials(user.name);
    
    // Update header
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    
    // Update profile details
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileId').textContent = user.id || user._id;
    document.getElementById('memberSince').textContent = formatDate(user.createdAt || user.created);
    document.getElementById('lastUpdated').textContent = formatDate(user.updatedAt || user.updated);
    
    showProfile();
};

// Load user statistics (products created, updated, etc.)
const loadUserStatistics = async (userId) => {
    try {
        // In a real application, you'd have specific endpoints for these statistics
        // For now, we'll simulate or use the products API
        
        const productsData = await apiCall(`${API_BASE}/products`);
        
        if (productsData.success && productsData.products) {
            const userProducts = productsData.products.filter(product => 
                product.createdBy === userId || product.createdBy._id === userId
            );
            
            document.getElementById('productsCreated').textContent = userProducts.length;
            
            // Calculate updated products (products where updatedBy is the current user)
            const updatedProducts = userProducts.filter(product => 
                product.updatedBy === userId || product.updatedBy?._id === userId
            );
            document.getElementById('productsUpdated').textContent = updatedProducts.length;
            
            // Calculate total access (simulated)
            document.getElementById('totalAccess').textContent = userProducts.length * 3; // Simulated data
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        // Set default values if there's an error
        document.getElementById('productsCreated').textContent = '0';
        document.getElementById('productsUpdated').textContent = '0';
        document.getElementById('totalAccess').textContent = '0';
    }
};

// Edit profile function
const editProfile = () => {
    // This would open a modal or navigate to an edit page
    alert('Edit profile functionality will be implemented soon!');
    
    // Example of what this might do:
    // const newName = prompt('Enter new name:', document.getElementById('profileName').textContent);
    // if (newName) {
    //     updateProfile({ name: newName });
    // }
};

// Change password function
const changePassword = () => {
    alert('Change password functionality will be implemented soon!');
    
    // Example implementation:
    // const currentPassword = prompt('Enter current password:');
    // const newPassword = prompt('Enter new password:');
    // const confirmPassword = prompt('Confirm new password:');
    // 
    // if (newPassword === confirmPassword) {
    //     changeUserPassword(currentPassword, newPassword);
    // } else {
    //     alert('Passwords do not match!');
    // }
};

// Update profile function (for future implementation)
const updateProfile = async (profileData) => {
    try {
        const response = await apiCall(`${API_BASE}/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        if (response.success) {
            alert('Profile updated successfully!');
            loadProfile(); // Reload the profile
        }
    } catch (error) {
        alert('Error updating profile: ' + error.message);
    }
};

// Logout function
const logout = async () => {
    try {
        const response = await apiCall(`${API_BASE}/auth/logout`, {
            method: 'POST'
        });
        
        if (response.success) {
            // Redirect to login page
            window.location.href = '/pages/login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if there's an error
        window.location.href = '/pages/login.html';
    }
};

// Check authentication and load profile on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to logout buttons
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    document.getElementById('logoutBtn2')?.addEventListener('click', logout);
    
    // Load the profile
    loadProfile();
});

// Export functions for global access
window.loadProfile = loadProfile;
window.editProfile = editProfile;
window.changePassword = changePassword;
window.logout = logout;