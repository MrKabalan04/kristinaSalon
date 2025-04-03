const { MongoClient } = require('mongodb');

// Connection reuse - create a cached connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set');
  }
  
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('kristina-nails');
  
  cachedDb = { client, db };
  return cachedDb;
}

exports.handler = async function(event, context) {
  // Set this to true to reuse the MongoDB connection across function invocations
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Handle OPTIONS request for CORS
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
  
  console.log("saveData function called with method:", event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log("Request body:", event.body);
    const data = JSON.parse(event.body);
    console.log("Parsed data:", JSON.stringify(data).substring(0, 200) + "...");
    
    console.log("Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("Connected to database, updating data...");
    
    const collection = db.collection('data');
    
    // Update or insert the document with _id: 'main-data'
    console.log("Updating document with _id: 'main-data'");
    await collection.updateOne(
      { _id: 'main-data' },
      { $set: data },
      { upsert: true }
    );
    
    console.log("Document updated successfully");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error saving data:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: 'Failed to save data', 
        details: error.message, 
        stack: error.stack 
      })
    };
  }
};

// This is just a proxy file that exports the handler from saveData.js
// This helps ensure case-insensitive routing works for Netlify functions

const { handler } = require('./saveData');
exports.handler = handler; 