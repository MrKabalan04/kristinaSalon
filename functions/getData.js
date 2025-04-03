const { MongoClient } = require('mongodb');

// Remove dotenv since Netlify handles env vars
// require('dotenv').config();

exports.handler = async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'MONGODB_URI not set' })
        };
    }

    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        
        const db = client.db('kristina-nails');
        const collection = db.collection('data');
        const data = await collection.findOne({ _id: 'main-data' });
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data || {
                services: [],
                categories: [],
                credentials: { username: 'admin', password: 'admin' }
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: 'Failed to fetch data' })
        };
    } finally {
        if (client) await client.close();
    }
}; 