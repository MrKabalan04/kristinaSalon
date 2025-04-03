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
        const dataRef = database.ref('data');
        const snapshot = await dataRef.get();
        
        if (!snapshot.exists()) {
            console.log('No data in Firebase');
            return [];
        }
        
        const data = snapshot.val();
        console.log('Fetched data:', data);
        
        // Return services array or empty array if no services
        return (data && Array.isArray(data.services)) ? data.services : [];
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
    
    try {
        const services = await fetchServices();
        console.log('Services to render:', services);
        
        if (!services || services.length === 0) {
            console.log('No services to display');
            servicesSection.innerHTML = '<p class="no-services">No services available</p>';
            return;
        }
        
        // Clear the services section
        servicesSection.innerHTML = '';
        
        // Group services by category
        const servicesByCategory = {};
        services.forEach(service => {
            const category = service.category || 'Other Services';
            if (!servicesByCategory[category]) {
                servicesByCategory[category] = [];
            }
            servicesByCategory[category].push(service);
        });
        
        // Render services by category
        Object.keys(servicesByCategory).sort().forEach(category => {
            if (category !== 'Other Services') {
                // Add category header
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = category;
                servicesSection.appendChild(categoryHeader);
                
                // Add services in this category
                servicesByCategory[category].forEach(service => {
                    const serviceItem = document.createElement('div');
                    serviceItem.className = 'service-item';
                    
                    // Format price based on price type
                    let price = service.price || '';
                    if (service.priceType === 'perNail') {
                        price = `${price} /nail`;
                    }
                    
                    serviceItem.innerHTML = `
                        <span class="service-name">${service.name}</span>
                        <span class="service-price">${price}</span>
                    `;
                    
                    servicesSection.appendChild(serviceItem);
                });
            }
        });
        
        // Add uncategorized services last
        if (servicesByCategory['Other Services'] && servicesByCategory['Other Services'].length > 0) {
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = 'Other Services';
            servicesSection.appendChild(categoryHeader);
            
            servicesByCategory['Other Services'].forEach(service => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-item';
                
                let price = service.price || '';
                if (service.priceType === 'perNail') {
                    price = `${price} /nail`;
                }
                
                serviceItem.innerHTML = `
                    <span class="service-name">${service.name}</span>
                    <span class="service-price">${price}</span>
                `;
                
                servicesSection.appendChild(serviceItem);
            });
        }
        
        console.log('Services rendered successfully');
    } catch (error) {
        console.error('Error rendering services:', error);
        servicesSection.innerHTML = '<p class="error">Error loading services. Please try again later.</p>';
    }
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