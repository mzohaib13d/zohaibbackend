// Main JavaScript file for the home page
console.log('ZohaibBackend frontend loaded successfully!');

// Check if user is logged in and update navigation
const updateNavigation = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/profile', {
      credentials: 'include',
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      const navLinks = document.querySelector('.nav-links');
      
      if (navLinks && data.success) {
        navLinks.innerHTML = `
          <a href="/pages/dashboard.html" class="nav-link">Dashboard</a>
          <a href="/pages/profile.html" class="nav-link">Profile</a>
          <button onclick="logout()" class="nav-link logout-btn">Logout</button>
        `;
      }
    } else if (response.status === 401) {
      // User is not logged in - this is NORMAL behavior
      console.log('User not logged in - showing default navigation');
      // Keep default navigation (Sign Up / Login links)
    }
  } catch (error) {
    // Network error or server down - show friendly message
    console.log('Server not reachable or network error');
  }
};

// Logout function
window.logout = async () => {
  try {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect even if logout fails
    window.location.href = '/index.html';
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', updateNavigation);