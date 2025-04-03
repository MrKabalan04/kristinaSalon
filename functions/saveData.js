const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function saveData(data) {
    try {
        console.log('Saving data to Firebase:', data);
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }
        
        // Ensure services and categories are arrays
        if (!Array.isArray(data.services)) {
            console.log('Services is not an array, converting to empty array');
            data.services = [];
        }
        
        if (!Array.isArray(data.categories)) {
            console.log('Categories is not an array, converting to empty array');
            data.categories = [];
        }
        
        // Filter out invalid services and categories
        data.services = data.services.filter(service => service && typeof service === 'object' && service.name);
        data.categories = data.categories.filter(category => category && typeof category === 'string' && category.trim() !== '');
        
        // Save to Firebase
        const dataRef = ref(database, 'data');
        await set(dataRef, {
            services: data.services,
            categories: data.categories,
            credentials: data.credentials || { username: 'admin', password: 'admin' }
        });
        
        console.log('Data saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

exports.handler = async function(event, context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };
    
    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Method not allowed'
            })
        };
    }
    
    try {
        let data;
        try {
            data = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid JSON in request body'
                })
            };
        }
        
        await saveData(data);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Data saved successfully'
            })
        };
    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};

// This is just a proxy file that exports the handler from saveData.js
// This helps ensure case-insensitive routing works for Netlify functions

const { handler } = require('./saveData');
exports.handler = handler; 