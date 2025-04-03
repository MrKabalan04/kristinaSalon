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
  
  console.log("getData function called with method:", event.httpMethod);
  
  try {
    console.log("Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("Connected to database, fetching data...");
    
    const collection = db.collection('data');
    
    // Get the single document that contains all data
    const data = await collection.findOne({ _id: 'main-data' });
    console.log("Data retrieved:", data ? "Found document" : "No document found");
    
    // Return default data if no document exists
    const responseData = data || {
      services: [],
      categories: ['Uncategorized'],
      credentials: { username: 'admin', password: 'admin' }
    };
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch data', 
        details: error.message,
        stack: error.stack
      })
    };
  }
}; 