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
        const testResult = await collection.findOne({ _id: 'main-data' });
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: true,
                message: "MongoDB connection successful",
                test_query: testResult ? "Document found" : "No document found"
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "MongoDB connection failed",
                error: error.message
            })
        };
    } finally {
        if (client) await client.close();
    }
}; 