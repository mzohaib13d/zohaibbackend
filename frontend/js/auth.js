// API Base URL
const API_BASE = 'http://localhost:5000/api';
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
  
// Utility Functions
const showError = (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = '#ef4444';
        
        const input = document.getElementById(elementId.replace('Error', ''));
        if (input) input.classList.add('error');
    } else {
        console.error('Element not found:', elementId);
    }
};

const clearError = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
        
        const input = document.getElementById(elementId.replace('Error', ''));
        if (input) input.classList.remove('error');
    }
};

const showSuccess = (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = '#10b981';
        element.style.display = 'block';
    }
};

// Password Validation
const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return errors;
};

// Real-time Password Validation
const setupPasswordValidation = () => {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const errors = validatePassword(password);
            
            clearError('passwordError');
            
            if (password.length > 0) {
                if (errors.length > 0) {
                    showError('passwordError', errors.join(', '));
                } else {
                    showSuccess('passwordError', 'Password strength: Strong ✓');
                }
            }
            
            // Validate password match in real-time
            if (confirmPasswordInput && confirmPasswordInput.value) {
                validatePasswordMatch();
            }
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
};

const validatePasswordMatch = () => {
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    clearError('confirmPasswordError');
    
    if (confirmPassword && password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        return false;
    }
    
    return true;
};

// Form Validation
const validateSignupForm = (formData) => {
    let isValid = true;
    
    // Name validation
    if (!formData.name.trim()) {
        showError('nameError', 'Name is required');
        isValid = false;
    } else if (formData.name.trim().length < 2) {
        showError('nameError', 'Name must be at least 2 characters long');
        isValid = false;
    } else {
        clearError('nameError');
    }
    
    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email.trim()) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(formData.email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError('emailError');
    }
    
    // Password validation
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
        showError('passwordError', passwordErrors.join(', '));
        isValid = false;
    } else {
        clearError('passwordError');
    }
    
    // Password match validation
    if (!validatePasswordMatch()) {
        isValid = false;
    }
    
    return isValid;
};

// API Calls
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
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Server error: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Signup Function
const handleSignup = async (formData) => {
    try {
        const submitBtn = document.querySelector('#signupForm button[type="submit"]');
        if (!submitBtn) {
            console.error('Submit button not found');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<div class="spinner"></div> Creating Account...';
        submitBtn.disabled = true;
        
        // Remove confirmPassword from the data sent to API
        const { confirmPassword, ...apiData } = formData;
        
        console.log('Sending signup request:', apiData);
        
        const data = await apiCall(`${API_BASE}/auth/signup`, {
            method: 'POST',
            body: JSON.stringify(apiData)
        });
        
        console.log('Signup response:', data);
        
        if (data.success) {
            // Show success message
            showSuccess('signupMessage', 'Account created successfully! Redirecting...');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = '/pages/dashboard.html';
            }, 2000);
        } else {
            throw new Error(data.message || 'Signup failed');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        
        // Show error in a safe way
        const errorElement = document.getElementById('signupMessage') || document.getElementById('emailError');
        if (errorElement) {
            showError(errorElement.id, error.message);
        } else {
            alert('Signup failed: ' + error.message);
        }
    } finally {
        const submitBtn = document.querySelector('#signupForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Create Account';
            submitBtn.disabled = false;
        }
    }
};

// Login Function
const handleLogin = async (formData) => {
    try {
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        if (!submitBtn) {
            console.error('Login button not found');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<div class="spinner"></div> Logging in...';
        submitBtn.disabled = true;
        
        console.log('Sending login request:', { email: formData.email });
        
        const data = await apiCall(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        console.log('Login response:', data);
        
        if (data.success) {
            showSuccess('loginMessage', 'Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = '/pages/dashboard.html';
            }, 1000);
        } else {
            throw new Error(data.message || 'Login failed');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        const errorElement = document.getElementById('loginMessage') || document.getElementById('emailError');
        if (errorElement) {
            showError(errorElement.id, error.message);
        } else {
            alert('Login failed: ' + error.message);
        }
    } finally {
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Login';
            submitBtn.disabled = false;
        }
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth.js loaded');
    
    setupPasswordValidation();
    
    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        console.log('Signup form found');
        
        // Create message element if it doesn't exist
        if (!document.getElementById('signupMessage')) {
            const messageDiv = document.createElement('div');
            messageDiv.id = 'signupMessage';
            messageDiv.className = 'error-message mt-2 text-center';
            signupForm.appendChild(messageDiv);
        }
        
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Signup form submitted');
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };
            
            console.log('Form data:', formData);
            
            if (validateSignupForm(formData)) {
                await handleSignup(formData);
            }
        });
    }
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found');
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submitted');
            
            const formData = {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            };
            
            // Basic validation
            if (!formData.email || !formData.password) {
                showError('loginMessage', 'Please fill in all fields');
                return;
            }
            
            await handleLogin(formData);
        });
    }
});

// Check authentication status
export const checkAuth = async () => {
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Logout function
export const logout = async () => {
    try {
        await apiCall(`${API_BASE}/auth/logout`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        window.location.href = '/index.html';
    }
};