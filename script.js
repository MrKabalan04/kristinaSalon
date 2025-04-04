import { createClient } from './supabase-config.js';

// Global Supabase client
const supabase = createClient();

// Function to fetch services from Supabase
async function fetchServices() {
    try {
        console.log('Fetching services...');
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*, categories(*)')
            .order('created_at', { ascending: true }); // Order by creation time, oldest first
            
        if (servicesError) {
            console.error('Error fetching services:', servicesError);
            throw servicesError;
        }
        console.log('Fetched services:', services);
        return services;
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

// Function to fetch categories from Supabase
async function fetchCategories() {
    try {
        console.log('Fetching categories...');
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true }); // Order by creation time, oldest first
            
        if (categoriesError) {
            console.error('Error fetching categories:', categoriesError);
            throw categoriesError;
        }
        console.log('Fetched categories:', categories);
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Function to render menu
function renderMenu(servicesByCategory) {
    const servicesSection = document.querySelector('.services-section');
    if (!servicesSection) return;
    
    servicesSection.innerHTML = '';

    // Sort categories by name
    const sortedCategories = Object.values(servicesByCategory).sort((a, b) => 
        a.name.localeCompare(b.name)
    );

    sortedCategories.forEach(category => {
        if (category.services.length > 0) {
            const categoryElement = document.createElement('div');
            categoryElement.classList.add('category-section');
            
            const categoryTitle = document.createElement('h2');
            categoryTitle.classList.add('category-title');
            categoryTitle.textContent = category.name;
            categoryElement.appendChild(categoryTitle);

            // Sort services by name within each category
            const sortedServices = category.services.sort((a, b) => 
                a.name.localeCompare(b.name)
            );

            sortedServices.forEach(service => {
                const serviceItem = document.createElement('div');
                serviceItem.classList.add('service-item');
                
                // Format price to handle both number and text inputs
                const priceText = service.price.toString().trim();
                const hasPrefix = priceText.startsWith('$');
                const displayPrice = hasPrefix ? priceText : priceText;
                
                serviceItem.innerHTML = `
                    <span class="service-name">${service.name}</span>
                    <span class="service-price">
                        ${hasPrefix ? '' : '<span class="price-suffix">$</span>'}
                        <span class="price-number">${displayPrice}</span>
                    </span>
                `;
                categoryElement.appendChild(serviceItem);
            });

            servicesSection.appendChild(categoryElement);
        }
    });

    // Add loading state handling
    servicesSection.classList.remove('loading');
}

// Function to load and render services
async function loadAndRenderServices() {
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
        servicesSection.classList.add('loading');
        servicesSection.innerHTML = '<p class="loading-text">Loading services...</p>';
    }

    try {
        const [services, categories] = await Promise.all([
            fetchServices(),
            fetchCategories()
        ]);

        console.log('Loaded data:', { services, categories });

        if (!services || services.length === 0) {
            console.log('No services found');
            if (servicesSection) {
                servicesSection.innerHTML = '<p class="no-services">No services available</p>';
            }
            return;
        }

        // Create HTML content
        const servicesHTML = document.createElement('div');

        // Group services by category
        const servicesByCategory = {};
        categories.forEach(category => {
            servicesByCategory[category.id] = {
                name: category.name,
                services: []
            };
        });

        // Add services to their categories or directly to the list
        services.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.classList.add('service-item');
            
            const priceText = service.price.toString().trim();
            const hasPrefix = priceText.startsWith('$');
            const displayPrice = hasPrefix ? priceText : priceText;
            
            serviceItem.innerHTML = `
                <span class="service-name">${service.name}</span>
                <span class="service-price">
                    ${hasPrefix ? '' : '<span class="price-suffix">$</span>'}
                    <span class="price-number">${displayPrice}</span>
                </span>
            `;

            if (service.category_id && service.categories) {
                // If service has a category, add it to that category's services
                if (!servicesByCategory[service.category_id]) {
                    servicesByCategory[service.category_id] = {
                        name: service.categories.name,
                        services: []
                    };
                }
                servicesByCategory[service.category_id].services.push(serviceItem);
            } else {
                // If no category, add directly to main container
                servicesHTML.appendChild(serviceItem);
            }
        });

        // Add categorized services after uncategorized ones
        Object.values(servicesByCategory).forEach(category => {
            if (category.services.length > 0) {
                const categoryElement = document.createElement('div');
                categoryElement.classList.add('category-section');
                
                const categoryTitle = document.createElement('h2');
                categoryTitle.classList.add('category-title');
                categoryTitle.textContent = category.name;
                categoryElement.appendChild(categoryTitle);

                // Add all services for this category
                category.services.forEach(serviceItem => {
                    categoryElement.appendChild(serviceItem);
                });

                servicesHTML.appendChild(categoryElement);
            }
        });

        // Update the services section
        servicesSection.innerHTML = '';
        servicesSection.appendChild(servicesHTML);
        servicesSection.classList.remove('loading');

    } catch (error) {
        console.error('Error loading data:', error);
        if (servicesSection) {
            servicesSection.innerHTML = '<p class="error">Error loading services. Please try again later.</p>';
        }
    }
}

// Theme functions
function applyTheme() {
    const isDarkMode = localStorage.getItem('theme') !== 'light'; // Default to dark mode
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(isDarkMode ? 'dark-mode' : 'light-mode');
    
    const darkIcon = document.querySelector('.dark-icon');
    const lightIcon = document.querySelector('.light-icon');
    
    if (darkIcon && lightIcon) {
        darkIcon.style.display = isDarkMode ? 'none' : 'block';
        lightIcon.style.display = isDarkMode ? 'block' : 'none';
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
    applyTheme();
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up theme
    applyTheme();
    
    // Add theme toggle listener
    const themeToggleBtn = document.getElementById('toggle-theme-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Load and render services
    loadAndRenderServices();
});
