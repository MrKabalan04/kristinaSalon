const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection reuse - create a cached connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    try {
      // For MongoDB driver v5+, check connection differently
      await cachedDb.client.db().admin().ping();
      console.log("Using cached database connection");
      return cachedDb;
    } catch (e) {
      console.log("Cached connection is no longer valid, creating a new one");
      cachedDb = null;
    }
  }
  
  console.log("Creating new database connection");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set');
  }
  
  try {
    console.log("Connecting to MongoDB...");
    
    // Create a new MongoClient with options compatible with v5
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000 // 45 seconds
    });
    
    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected to MongoDB successfully");
    
    // Get reference to the database
    const db = client.db('kristina-nails');
    
    // Cache the database connection
    cachedDb = { client, db };
    return cachedDb;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
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