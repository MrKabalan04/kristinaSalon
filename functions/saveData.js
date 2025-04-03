const { MongoClient } = require('mongodb');

// Remove dotenv since Netlify handles env vars
// require('dotenv').config();

exports.handler = async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            body: ""
        };
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'MONGODB_URI not set' })
        };
    }

    let client;
    try {
        const data = JSON.parse(event.body);
        client = new MongoClient(uri);
        await client.connect();
        
        const db = client.db('kristina-nails');
        const collection = db.collection('data');
        
        await collection.updateOne(
            { _id: 'main-data' },
            { $set: data },
            { upsert: true }
        );
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: 'Failed to save data' })
        };
    } finally {
        if (client) await client.close();
    }
};

// This is just a proxy file that exports the handler from saveData.js
// This helps ensure case-insensitive routing works for Netlify functions

const { handler } = require('./saveData');
exports.handler = handler; 