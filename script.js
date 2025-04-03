// Set initial theme if not already set
if (localStorage.getItem('darkMode') === null) {
    // Default to dark mode
    localStorage.setItem('darkMode', 'true');
}

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBimsxijDPv8t_pEtoFPpvCMxIopvQ3_y8",
    authDomain: "kristinanails.firebaseapp.com",
    projectId: "kristinanails",
    storageBucket: "kristinanails.firebasestorage.app",
    messagingSenderId: "1031548052588",
    appId: "1:1031548052588:web:730d1eb220ba5401b3a449",
    measurementId: "G-3SN5X0BLZM",
    databaseURL: "https://kristinanails-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Function to fetch services from Firebase
async function fetchServices() {
    try {
        console.log('Fetching services from Firebase...');
        const API_URL = window.location.hostname === 'localhost' 
          ? 'http://localhost:8888/.netlify/functions' 
          : '/.netlify/functions';
          
        const response = await fetch(`${API_URL}/getData`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Fetched data:', result);
        
        if (result.success && result.data) {
            // Make sure we're returning an array of services
            const services = Array.isArray(result.data.services) ? result.data.services : [];
            console.log('Services to render:', services);
            return services;
        }
        console.log('No services found in data');
        return [];
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

// Function to render services
async function renderServices() {
    console.log('Starting to render services...');
    const servicesSection = document.querySelector('.services-section');
    if (!servicesSection) {
        console.error('Services section not found');
        return;
    }
    
    servicesSection.innerHTML = '';
    
    const services = await fetchServices();
    console.log('Services to render:', services);
    
    if (!services || services.length === 0) {
        console.log('No services to render');
        servicesSection.innerHTML = '<p class="no-services">No services available</p>';
        return;
    }
    
    let currentCategory = null;
    
    services.forEach(item => {
        console.log('Processing service:', item);
        
        if (item.spacer) {
            const spacer = document.createElement('div');
            spacer.className = 'service-spacer';
            servicesSection.appendChild(spacer);
            currentCategory = null;
            return;
        }
        
        // Check if item has a category and it's different from current
        if (item.category && item.category !== currentCategory) {
            currentCategory = item.category;
            
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = currentCategory;
            servicesSection.appendChild(categoryHeader);
        }
        
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        
        // Format price based on price type
        let price = item.price || '';
        if (item.priceType === 'perNail') {
            price = `${price} /nail`;
        }
        
        serviceItem.innerHTML = `
            <span class="service-name">${item.name}</span>
            <span class="service-price">${price}</span>
        `;
        
        servicesSection.appendChild(serviceItem);
    });
    
    console.log('Services rendered successfully');
}

// Function to apply theme
function applyTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Remove both classes first
    document.body.classList.remove('dark-mode');
    document.body.classList.remove('light-mode');
    
    // Then add the appropriate class
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.add('light-mode');
    }
    
    // Update icon visibility
    const darkIcon = document.querySelector('.dark-icon');
    const lightIcon = document.querySelector('.light-icon');
    
    if (darkIcon && lightIcon) {
        if (isDarkMode) {
            darkIcon.style.display = 'none';
            lightIcon.style.display = 'block';
        } else {
            darkIcon.style.display = 'block';
            lightIcon.style.display = 'none';
        }
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    localStorage.setItem('darkMode', (!isDarkMode).toString());
    applyTheme();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Apply theme
    applyTheme();
    
    // Add event listener to theme toggle button
    const themeToggleBtn = document.getElementById('toggle-theme-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleDarkMode);
    }

    // Load and display services
    renderServices();
});