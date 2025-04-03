// Global variables
let services = [];
let categories = [];
let currentService = null;
let currentEditIndex = null;
let currentPriceType = 'fixed';
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let data = {}; // Store the complete data object
let isReorganizing = false; // Flag to prevent multiple auto-saves during reorganization

// API endpoints
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8888/.netlify/functions' 
  : '/.netlify/functions';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBimsxijDPv8t_pEtoFPpvCMxIopvQ3_y8",
    authDomain: "kristinanails.firebaseapp.com",
    databaseURL: "https://kristinanails-default-rtdb.europe-west1.firebasedatabase.app",
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
const db = firebase.database();

// Sign in anonymously to allow database access
firebase.auth().signInAnonymously()
    .then(() => {
        console.log('Signed in anonymously');
    })
    .catch((error) => {
        console.error('Error signing in:', error);
    });

// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.uid);
    } else {
        console.log('User is signed out');
    }
});

// DOM Elements
const loginContainer = document.querySelector('.login-container');
const adminPanel = document.querySelector('.admin-panel');
const loginForm = document.querySelector('.login-form');
const errorMessage = document.querySelector('.error-message');
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');
const servicesList = document.querySelector('.services-list');
const categoriesList = document.querySelector('.categories-list');
const addServiceBtn = document.querySelector('.add-service');
const addCategoryBtn = document.querySelector('.add-category');
const logoutBtn = document.querySelector('.logout-btn');
const serviceModal = document.getElementById('service-modal');
const categoryModal = document.getElementById('category-modal');
const serviceForm = document.getElementById('service-form');
const categoryForm = document.getElementById('category-form');
const successMessage = document.querySelector('.success-message');
const notificationModal = document.createElement('div');
notificationModal.className = 'notification-modal';
notificationModal.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: #4CAF50;
    color: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
    display: none;
    transition: opacity 0.3s ease;
`;
document.body.appendChild(notificationModal);

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initializeApp();
    
    // Add event listeners
    loginForm?.addEventListener('submit', handleLogin);
    navItems.forEach(item => item.addEventListener('click', handleNavigation));
    addServiceBtn?.addEventListener('click', () => openServiceModal());
    addCategoryBtn?.addEventListener('click', () => openCategoryModal());
    logoutBtn?.addEventListener('click', handleLogout);
    serviceForm?.addEventListener('submit', handleServiceSubmit);
    categoryForm?.addEventListener('submit', handleCategorySubmit);
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn?.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Apply theme
    applyTheme();
});

// Initialize application
async function initializeApp() {
    try {
        // Check if user is logged in
        if (localStorage.getItem('adminSession') === 'active') {
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'grid';
            await loadData();
            
            // Set initial button visibility based on default view (services)
            if (addServiceBtn && addCategoryBtn) {
                addServiceBtn.style.display = 'flex';
                addCategoryBtn.style.display = 'none';
            }
        } else {
            loginContainer.style.display = 'block';
            adminPanel.style.display = 'none';
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error initializing application', false);
    }
}

// Load data from Firebase Realtime Database
async function loadData() {
    try {
        console.log('Loading data from Firebase...');
        
        // Fetch data from Firebase
        const snapshot = await db.ref('/').once('value');
        const data = snapshot.val() || {};
        
        // Extract services and categories
        services = Array.isArray(data.services) ? data.services : [];
        categories = Array.isArray(data.categories) ? data.categories : [];
        
        console.log('Data loaded:', { services, categories });
        
        // Save to localStorage as backup
        localStorage.setItem('salonData', JSON.stringify({ services, categories }));
        
        renderServices();
        renderCategories();
        updateCategorySelects();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data. Using local data if available.', false);
        
        // Try localStorage as fallback
        const localData = localStorage.getItem('salonData');
        if (localData) {
            const jsonData = JSON.parse(localData);
            services = Array.isArray(jsonData.services) ? jsonData.services : [];
            categories = Array.isArray(jsonData.categories) ? jsonData.categories : [];
            
            renderServices();
            renderCategories();
            updateCategorySelects();
        }
    }
}

// Save data to Firebase Realtime Database
async function saveData() {
    try {
        console.log('Saving data to Firebase...');
        
        // Filter out any invalid services or categories
        const validServices = services.filter(service => service && service.name);
        const validCategories = categories.filter(category => category && typeof category === 'string');
        
        // Save to Firebase
        await db.ref('/').set({
            services: validServices,
            categories: validCategories
        });
        
        console.log('Data saved successfully');
        
        // Save to localStorage as backup
        localStorage.setItem('salonData', JSON.stringify({ 
            services: validServices, 
            categories: validCategories 
        }));
        
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Failed to save to Firebase. Changes saved locally.', false);
        return false;
    }
}

// Render services list
function renderServices() {
    if (!servicesList) return;
    
    servicesList.innerHTML = services.map(service => `
        <div class="service-item">
            <div class="service-info">
                <div class="service-name">${service.name}</div>
                ${service.category ? `<div class="service-category">${service.category}</div>` : ''}
                <div class="service-price">${service.price}</div>
            </div>
            <div class="service-actions">
                <button class="action-btn edit" onclick="editService('${service.name}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteService('${service.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Render categories list
function renderCategories() {
    if (!categoriesList) return;
    
    categoriesList.innerHTML = '';
    
    // Filter out null or empty categories
    categories = categories.filter(category => category && category.trim() !== '');
    
    categories.forEach((category, index) => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        // Count services in this category
        const serviceCount = services.filter(service => service.category === category).length;
        
        categoryItem.innerHTML = `
            <div class="category-info">
                <span class="category-name">${category}</span>
                <span class="service-count">${serviceCount} services</span>
            </div>
            <div class="category-actions">
                <button class="action-btn edit" onclick="editCategory('${category}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteCategory('${category}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        categoriesList.appendChild(categoryItem);
    });
}

// Edit category
async function editCategory(categoryName) {
    const oldName = categoryName;
    const newName = prompt('Enter new category name:', categoryName);
    
    if (newName && newName.trim() !== '' && newName !== oldName) {
        // Update category name in categories array
        const index = categories.indexOf(oldName);
        if (index !== -1) {
            categories[index] = newName;
            
            // Update category name in all services
            services = services.map(service => {
                if (service.category === oldName) {
                    return { ...service, category: newName };
                }
                return service;
            });
            
            // Save changes
            const success = await saveData();
            if (success) {
                showNotification('Category updated successfully');
                renderCategories();
                renderServices();
                updateCategorySelects();
            }
        }
    }
}

// Update category selects
function updateCategorySelects() {
    const categorySelects = document.querySelectorAll('.category-select');
    categorySelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = `
            <option value="">No Category</option>
            ${categories.map(category => `
                <option value="${category}" ${currentValue === category ? 'selected' : ''}>
                    ${category}
                </option>
            `).join('')}
        `;
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('adminSession', 'active');
        loginContainer.style.display = 'none';
        adminPanel.style.display = 'grid';
        await loadData();
    } else {
        errorMessage.textContent = 'Invalid username or password';
        errorMessage.style.display = 'block';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('adminSession');
    loginContainer.style.display = 'block';
    adminPanel.style.display = 'none';
}

// Handle navigation
function handleNavigation(e) {
    const view = e.target.closest('.nav-item').dataset.view;
    
    // Update active nav item
    navItems.forEach(item => item.classList.remove('active'));
    e.target.closest('.nav-item').classList.add('active');
    
    // Update visible section
    viewSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${view}-view`) {
            section.classList.add('active');
        }
    });

    // Update title and buttons visibility
    document.querySelector('.admin-title').textContent = 
        view.charAt(0).toUpperCase() + view.slice(1) + ' Management';
    
    // Show/hide appropriate add buttons
    if (addServiceBtn && addCategoryBtn) {
        if (view === 'services') {
            addServiceBtn.style.display = 'flex';
            addCategoryBtn.style.display = 'none';
        } else if (view === 'categories') {
            addServiceBtn.style.display = 'none';
            addCategoryBtn.style.display = 'flex';
        } else {
            // For other views (like settings), hide both
            addServiceBtn.style.display = 'none';
            addCategoryBtn.style.display = 'none';
        }
    }
}

// Delete service
async function deleteService(serviceName) {
    if (confirm('Are you sure you want to delete this service?')) {
        services = services.filter(service => service.name !== serviceName);
        await saveData();
        renderServices();
        showNotification('Service deleted successfully');
    }
}

// Delete category
async function deleteCategory(categoryName) {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
        return;
    }
    
    // Remove category from list
    categories = categories.filter(cat => cat !== categoryName);
    
    // Update services that used this category
    services = services.map(service => {
        if (service.category === categoryName) {
            return { ...service, category: '' };
        }
        return service;
    });
    
    // Save changes
    const success = await saveData();
    if (success) {
        showNotification('Category deleted successfully');
        renderCategories();
        renderServices();
        updateCategorySelects();
    }
}

// Show message
function showMessage(text, isSuccess = true) {
    const messageElement = document.querySelector('.success-message');
    if (!messageElement) return;
    
    messageElement.textContent = text;
    messageElement.style.backgroundColor = isSuccess ? 'var(--success-color)' : 'var(--danger-color)';
    messageElement.style.display = 'block';
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

// Open service modal
function openServiceModal(service = null) {
    currentService = service;
    const modal = document.getElementById('service-modal');
    const form = document.getElementById('service-form');
    const title = modal.querySelector('.modal-title');
    
    title.textContent = service ? 'Edit Service' : 'Add Service';
    
    if (service) {
        const existingService = services.find(s => s.name === service);
        if (existingService) {
            form.querySelector('#service-name').value = existingService.name;
            form.querySelector('#service-category').value = existingService.category || '';
            form.querySelector('#service-price').value = existingService.price || '';
        }
    } else {
        form.reset();
    }
    
    modal.style.display = 'flex';
}

// Category modal functions
function openCategoryModal() {
    if (!categoryModal || !categoryForm) return;
    categoryForm.reset();
    categoryModal.style.display = 'flex';
}

// Handle service submission
async function handleServiceSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(serviceForm);
    const serviceData = {
        name: formData.get('service-name').trim(),
        price: formData.get('service-price').trim(),
        priceType: currentPriceType,
        category: formData.get('service-category').trim() || '' // Make category optional
    };
    
    // Validate required fields
    if (!serviceData.name || !serviceData.price) {
        showNotification('Name and price are required', false);
        return;
    }
    
    if (currentEditIndex !== null) {
        // Update existing service
        services[currentEditIndex] = serviceData;
    } else {
        // Add new service
        services.push(serviceData);
    }
    
    // Save to Firebase
    const success = await saveData();
    if (success) {
        showNotification(currentEditIndex !== null ? 'Service updated successfully' : 'Service added successfully');
        serviceModal.style.display = 'none';
        serviceForm.reset();
        currentEditIndex = null;
        renderServices();
    }
}

// Edit service
function editService(serviceName) {
    const service = services.find(s => s.name === serviceName);
    if (service) {
        currentEditIndex = services.indexOf(service);
        document.getElementById('service-name').value = service.name;
        document.getElementById('service-price').value = service.price;
        document.getElementById('service-category').value = service.category || '';
        currentPriceType = service.priceType || 'fixed';
        serviceModal.style.display = 'block';
    }
}

// Handle category submission
async function handleCategorySubmit(event) {
    event.preventDefault();
    
    const categoryNameInput = document.getElementById('category-name');
    const categoryName = categoryNameInput.value.trim();
    
    if (!categoryName) {
        showNotification('Please enter a category name', false);
        return;
    }
    
    // Check if category already exists
    if (categories.includes(categoryName)) {
        showNotification('This category already exists', false);
        return;
    }
    
    // Add new category
    categories.push(categoryName);
    
    // Save to Firebase
    const success = await saveData();
    if (success) {
        showNotification('Category added successfully');
        categoryNameInput.value = '';
        categoryModal.style.display = 'none';
        renderCategories();
        updateCategorySelects();
    }
}

// Reorganize services to include automatic spacers between categories
function reorganizeServicesWithSpacers() {
    isReorganizing = true;
    
    // Track current and previous categories
    let currentCategory = null;
    let previousCategory = null;
    let reorganizedServices = [];
    
    // First pass: Remove all existing spacers
    const servicesWithoutSpacers = services.filter(item => !item.spacer);
    
    // Sort services by category to ensure they're grouped properly
    servicesWithoutSpacers.sort((a, b) => {
        const catA = a.category || 'Uncategorized';
        const catB = b.category || 'Uncategorized';
        return catA.localeCompare(catB);
    });
    
    // Second pass: Add services with spacers between categories
    servicesWithoutSpacers.forEach((item, index) => {
        currentCategory = item.category || 'Uncategorized';
        
        // If we're switching to a new category and it's not the first one, add a spacer
        if (currentCategory !== previousCategory && previousCategory !== null) {
            reorganizedServices.push({ spacer: true });
        }
        
        reorganizedServices.push(item);
        previousCategory = currentCategory;
    });
    
    services = reorganizedServices;
    isReorganizing = false;
}

// Show success message
function showSuccessMessage(message) {
    const successMessage = document.getElementById('success-message');
    successMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    successMessage.style.backgroundColor = 'var(--success-color)';
    successMessage.style.display = 'flex';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Show error message
function showErrorMessage(message) {
    const successMessage = document.getElementById('success-message');
    successMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    successMessage.style.backgroundColor = 'var(--error-color)';
    successMessage.style.display = 'flex';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
        successMessage.style.backgroundColor = 'var(--success-color)';
    }, 3000);
}

// Clean up existing problematic data
function cleanupExistingData() {
    if (!services || !Array.isArray(services)) return;
    
    let dataChanged = false;
    
    services.forEach(service => {
        // Skip spacers
        if (service.spacer) return;
        
        // Fix extremely long prices
        if (service.price && service.price.length > 10) {
            service.price = service.price.substring(0, 10) + '$';
            if (service.price.includes('/nail')) {
                service.price = service.price.substring(0, 7) + '$ /nail';
            }
            dataChanged = true;
        }
        
        // Ensure prices have $ symbol
        if (service.price && !service.price.includes('$') && !service.price.toLowerCase().includes('half')) {
            service.price = `${service.price}$`;
            dataChanged = true;
        }
    });
    
    // Save if we made any changes
    if (dataChanged) {
        saveData(data);
    }
}

// Toggle dark/light mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    
    applyTheme();
}

// Apply the current theme
function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

function showNotification(message, isSuccess = true) {
    notificationModal.textContent = message;
    notificationModal.style.background = isSuccess ? '#4CAF50' : '#f44336';
    notificationModal.style.display = 'block';
    notificationModal.style.opacity = '1';
    
    setTimeout(() => {
        notificationModal.style.opacity = '0';
        setTimeout(() => {
            notificationModal.style.display = 'none';
        }, 300);
    }, 2000);
} 