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

exports.handler = async function(event, context) {
    // Set CORS headers for all responses
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }

        // Ensure services and categories are arrays
        if (!Array.isArray(data.services)) {
            data.services = [];
        }
        if (!Array.isArray(data.categories)) {
            data.categories = [];
        }
        
        // Save data to Firebase
        const dataRef = ref(database, 'data');
        await set(dataRef, data);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: 'Data saved successfully' 
            })
        };
    } catch (error) {
        console.error('Firebase error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false,
                error: 'Failed to save data to database' 
            })
        };
    }
};

// This is just a proxy file that exports the handler from saveData.js
// This helps ensure case-insensitive routing works for Netlify functions

const { handler } = require('./saveData');
exports.handler = handler; 