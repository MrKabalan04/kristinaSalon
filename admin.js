import { createClient } from './supabase-config.js';

// Initialize Supabase client
const supabase = createClient();
console.log('Supabase client initialized');

// Global state
let currentServices = [];
let currentCategories = [];

// Initialize admin panel
async function initAdminPanel() {
    console.log('Initializing admin panel...');
    try {
        // Check if user is logged in via localStorage
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            console.log('Not logged in via localStorage, redirecting...');
            window.location.href = 'login.html';
            return;
        }

        console.log('Loading initial data...');
        // Load initial data
        await Promise.all([
            loadCategories(),
            loadServices()
        ]);

        setupEventListeners();
        showSection('services'); // Default to services section
        console.log('Admin panel initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Error initializing application. Please refresh the page.');
    }
}

// Load categories from Supabase
async function loadCategories() {
    console.log('Loading categories...');
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true }); // Order by creation time, oldest first

        if (error) throw error;

        currentCategories = data || [];
        console.log('Categories loaded:', currentCategories);
        renderCategories();
        updateCategoryDropdowns();
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Error loading categories');
    }
}

// Load services from Supabase
async function loadServices() {
    console.log('Loading services...');
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*, categories(*)')
            .order('created_at', { ascending: true }); // Order by creation time, oldest first

        if (error) throw error;

        currentServices = data || [];
        console.log('Services loaded:', currentServices);
        renderServices();
    } catch (error) {
        console.error('Error loading services:', error);
        showToast('Error loading services');
    }
}


// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('[data-section]').dataset.section;
            if (section) {
                console.log('Switching to section:', section);
                showSection(section);
            }
        });
    });

    // Add buttons
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            console.log('Opening add service modal');
            resetForm('serviceForm');
            document.getElementById('serviceModalTitle').textContent = 'Add New Service';
            const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
            modal.show();
        });
    }

    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            console.log('Opening add category modal');
            resetForm('categoryForm');
            document.getElementById('categoryModalTitle').textContent = 'Add New Category';
            const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
            modal.show();
        });
    }

    // Form submissions
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceSubmit);
    }

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    console.log('Event listeners setup complete');
}

// Handle service form submission
async function handleServiceSubmit(e) {
    e.preventDefault();
    console.log('Handling service form submission...');
    
    const form = e.target;
    const serviceId = form.dataset.serviceId;
    
    const serviceData = {
        name: form.name.value.trim(),
        price: form.price.value.trim(),
        category_id: form.category.value || null
    };

    console.log('Submitting service data:', serviceData);

    try {
        const supabase = createClient();
        
        // Check session before submitting
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session during submission:', session);

        let result;
        if (serviceId) {
            console.log('Updating existing service:', serviceId);
            result = await supabase.from('services').update(serviceData).eq('id', serviceId);
        } else {
            console.log('Creating new service');
            result = await supabase.from('services').insert(serviceData);
        }

        console.log('Supabase response:', result);

        if (result.error) {
            console.error('Supabase error:', result.error);
            throw result.error;
        }

        await loadServices();
        closeModal('serviceModal');
        showToast(serviceId ? 'Service updated successfully' : 'Service added successfully');
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
        showToast(`Error saving service: ${error.message}`);
    }
}

// Handle category form submission
async function handleCategorySubmit(e) {
    e.preventDefault();
    console.log('Handling category form submission...');
    
    const form = e.target;
    const categoryId = form.dataset.categoryId;
    
    const categoryData = {
        name: form.categoryName.value.trim()
    };

    console.log('Category data:', categoryData);

    try {
        const { error } = categoryId
            ? await supabase.from('categories').update(categoryData).eq('id', categoryId)
            : await supabase.from('categories').insert(categoryData);

        if (error) throw error;

        await loadCategories();
        closeModal('categoryModal');
        showToast(categoryId ? 'Category updated successfully' : 'Category added successfully');
    } catch (error) {
        console.error('Error saving category:', error);
        showToast('Error saving category');
    }
}

// Render services table
function renderServices() {
    console.log('Rendering services table...');
    const tbody = document.querySelector('#servicesTable tbody');
    if (!tbody) return;

    tbody.innerHTML = currentServices.map(service => `
        <tr>
            <td>${service.name}</td>
            <td>${service.price}</td>
            <td>${service.categories?.name || 'No Category'}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editService('${service.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteService('${service.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Render categories table
function renderCategories() {
    console.log('Rendering categories table...');
    const tbody = document.querySelector('#categoriesTable tbody');
    if (!tbody) return;

    tbody.innerHTML = currentCategories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editCategory('${category.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update category dropdowns
function updateCategoryDropdowns() {
    console.log('Updating category dropdowns...');
    const select = document.getElementById('category');
    if (!select) return;

    select.innerHTML = `
        <option value="">Select Category</option>
        ${currentCategories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('')}
    `;
}

// Edit service
window.editService = function(id) {
    console.log('Editing service:', id);
    const service = currentServices.find(s => s.id === id);
    if (!service) return;

    const form = document.getElementById('serviceForm');
    form.dataset.serviceId = id;
    form.name.value = service.name;
    form.price.value = service.price;
    form.category.value = service.category_id || '';

    document.getElementById('serviceModalTitle').textContent = 'Edit Service';
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    modal.show();
};

// Delete service
window.deleteService = async function(id) {
    console.log('Deleting service:', id);
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;

        await loadServices();
        showToast('Service deleted successfully');
    } catch (error) {
        console.error('Error deleting service:', error);
        showToast('Error deleting service');
    }
};

// Edit category
window.editCategory = function(id) {
    console.log('Editing category:', id);
    const category = currentCategories.find(c => c.id === id);
    if (!category) return;

    const form = document.getElementById('categoryForm');
    form.dataset.categoryId = id;
    form.categoryName.value = category.name;

    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
};

// Delete category
window.deleteCategory = async function(id) {
    console.log('Deleting category:', id);
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;

        await loadCategories();
        showToast('Category deleted successfully');
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Error deleting category');
    }
};

// Handle logout
async function handleLogout() {
    console.log('Handling logout...');
    try {
        // Clear Supabase session
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear localStorage
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('isLoggedIn');

        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error during logout:', error);
        showToast('Error during logout');
    }
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${sectionName}Section`).style.display = 'block';
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });

    // Update header and buttons
    const sectionTitle = document.getElementById('sectionTitle');
    const addServiceBtn = document.getElementById('addServiceBtn');
    const addCategoryBtn = document.getElementById('addCategoryBtn');

    if (sectionName === 'services') {
        sectionTitle.textContent = 'Services Management';
        addServiceBtn.style.display = 'block';
        addCategoryBtn.style.display = 'none';
    } else if (sectionName === 'categories') {
        sectionTitle.textContent = 'Categories Management';
        addServiceBtn.style.display = 'none';
        addCategoryBtn.style.display = 'block';
    }
}

// Reset form
function resetForm(formId) {
    console.log('Resetting form:', formId);
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.reset();
    delete form.dataset.serviceId;
    delete form.dataset.categoryId;
}

// Close modal
function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modalElement = document.getElementById(modalId);
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
}

// Show toast notification
function showToast(message) {
    console.log('Showing toast:', message);
    const modalElement = document.getElementById('notificationModal');
    const messageElement = document.getElementById('notificationMessage');
    
    if (modalElement && messageElement) {
        messageElement.textContent = message;
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        setTimeout(() => modal.hide(), 2000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminPanel);