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

async function getData() {
    try {
        console.log('Fetching data from Firebase...');
        const dataRef = ref(database, 'data');
        const snapshot = await get(dataRef);
        
        if (!snapshot.exists()) {
            console.log('No data found in Firebase, returning default structure');
            return {
                services: [],
                categories: []
            };
        }
        
        const data = snapshot.val();
        console.log('Raw data from Firebase:', data);
        
        // Ensure proper data structure
        const processedData = {
            services: Array.isArray(data.services) ? data.services.filter(service => service && service.name) : [],
            categories: Array.isArray(data.categories) ? data.categories.filter(category => category && category.trim() !== '') : []
        };
        
        console.log('Processed data:', processedData);
        return processedData;
    } catch (error) {
        console.error('Error fetching data:', error);
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
    
    if (event.httpMethod !== 'GET') {
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
        const data = await getData();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: data
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