const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const fs = require('fs').promises;
const path = require('path');

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

async function migrateData() {
    try {
        // Read data.json
        const dataPath = path.join(__dirname, '..', 'data.json');
        const jsonData = await fs.readFile(dataPath, 'utf8');
        const data = JSON.parse(jsonData);

        // Save to Firebase
        const dataRef = ref(database, 'data');
        await set(dataRef, data);

        console.log('Data migrated successfully to Firebase');
        return true;
    } catch (error) {
        console.error('Error migrating data:', error);
        return false;
    }
}

// Export the handler for Netlify
exports.handler = async function(event, context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

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
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const success = await migrateData();
    
    return {
        statusCode: success ? 200 : 500,
        headers,
        body: JSON.stringify({
            success,
            message: success ? 'Data migrated successfully' : 'Failed to migrate data'
        })
    };
}; 