const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
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

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        console.log('Fetching data from Firebase...');
        
        // Get data from Firebase
        const dataRef = ref(database, 'data');
        const snapshot = await get(dataRef);
        
        console.log('Firebase snapshot:', snapshot.exists() ? 'Data exists' : 'No data');
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('Data retrieved:', JSON.stringify(data).substring(0, 100) + '...');
            
            // Ensure services and categories are arrays
            if (!Array.isArray(data.services)) {
                data.services = [];
            }
            if (!Array.isArray(data.categories)) {
                data.categories = [];
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: data
                })
            };
        } else {
            console.log('No data found, returning default structure');
            
            // Return default data if nothing exists
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: {
                        services: [],
                        categories: [],
                        credentials: { username: 'admin', password: 'admin' }
                    }
                })
            };
        }
    } catch (error) {
        console.error('Firebase error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false,
                error: 'Failed to fetch data from database: ' + error.message
            })
        };
    }
}; 