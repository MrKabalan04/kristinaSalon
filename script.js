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
    measurementId: "G-3SN5X0BLZM"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Function to fetch services from Firestore
async function fetchServices() {
    try {
        console.log('Fetching services from Firestore...');
        const servicesSnapshot = await db.collection('services').get();
        
        if (servicesSnapshot.empty) {
            console.log('No services found in Firestore');
            return [];
        }
        
        const services = [];
        servicesSnapshot.forEach(doc => {
            services.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('Fetched services:', services);
        return services;
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

// Function to fetch categories from Firestore
async function fetchCategories() {
    try {
        console.log('Fetching categories from Firestore...');
        const categoriesSnapshot = await db.collection('categories').get();
        
        if (categoriesSnapshot.empty) {
            console.log('No categories found in Firestore');
            return [];
        }
        
        const categories = [];
        categoriesSnapshot.forEach(doc => {
            categories.push(doc.data().name);
        });
        
        console.log('Fetched categories:', categories);
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
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
        const [services, categories] = await Promise.all([
            fetchServices(),
            fetchCategories()
        ]);
        
        console.log('Data fetched:', { services, categories });
        
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
            if (!service) return; // Skip null/undefined services
            const category = service.category || 'Other Services';
            if (!servicesByCategory[category]) {
                servicesByCategory[category] = [];
            }
            servicesByCategory[category].push(service);
        });
        
        // Sort categories alphabetically, but keep "Other Services" at the end
        const sortedCategories = Object.keys(servicesByCategory).sort((a, b) => {
            if (a === 'Other Services') return 1;
            if (b === 'Other Services') return -1;
            return a.localeCompare(b);
        });
        
        // Render services by category
        sortedCategories.forEach(category => {
            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category;
            servicesSection.appendChild(categoryHeader);
            
            // Add services in this category
            servicesByCategory[category].forEach(service => {
                if (!service || !service.name) return; // Skip invalid services
                
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
        });
        
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
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing Firebase...');
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        console.log('Firebase initialized');
        
        // Apply theme
        applyTheme();
        
        // Add event listener to theme toggle button
        const themeToggleBtn = document.getElementById('toggle-theme-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleDarkMode);
        }
        
        // Load and display services
        await renderServices();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});