// Set initial theme if not already set
if (localStorage.getItem('darkMode') === null) {
    // Default to dark mode
    localStorage.setItem('darkMode', 'true');
}

// Function to fetch services from data.json
async function fetchServices() {
    try {
        const API_URL = window.location.hostname === 'localhost' 
          ? 'http://localhost:8888/.netlify/functions' 
          : '/.netlify/functions';
          
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        return data.services;
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

// Function to render services
async function renderServices() {
    const servicesSection = document.querySelector('.services-section');
    if (!servicesSection) {
        return;
    }
    
    servicesSection.innerHTML = '';
    
    const services = await fetchServices();
    if (!services || services.length === 0) {
        servicesSection.innerHTML = '<p class="no-services">No services available</p>';
        return;
    }
    
    let currentCategory = null;
    
    services.forEach(item => {
        if (item.spacer) {
            const spacer = document.createElement('div');
            spacer.className = 'service-spacer';
            servicesSection.appendChild(spacer);
            currentCategory = null; // Reset category after spacer
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
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const servicesSection = document.querySelector('.services-section');
            
            data.services.forEach(service => {
                if (service.spacer) {
                    // Add a spacer div with margin
                    const spacer = document.createElement('div');
                    spacer.style.marginBottom = '20px';
                    servicesSection.appendChild(spacer);
                    return;
                }

                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-item';
                
                const serviceName = document.createElement('div');
                serviceName.className = 'service-name';
                serviceName.textContent = service.name;
                
                const servicePrice = document.createElement('div');
                servicePrice.className = 'service-price';
                servicePrice.textContent = service.price;
                
                serviceItem.appendChild(serviceName);
                serviceItem.appendChild(servicePrice);
                servicesSection.appendChild(serviceItem);
            });
        })
        .catch(error => console.error('Error loading services:', error));
});