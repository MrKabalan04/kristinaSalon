const { MongoClient } = require('mongodb');

// Remove dotenv since Netlify handles env vars
// require('dotenv').config();

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log("Starting debug function");
  const uri = process.env.MONGODB_URI;
  
  // Get MongoDB connection string (sanitized)
  const sanitizedUri = uri ? 
    uri.substring(0, uri.indexOf(':')) + ':****@' + uri.substring(uri.indexOf('@') + 1) : 
    'MONGODB_URI not set';
  
  let client = null;
  try {
    console.log("Creating MongoDB client");
    client = new MongoClient(uri);
    
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB successfully");
    
    // Test database access
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
        uri_prefix: sanitizedUri,
        test_query: testResult ? "Document found" : "No document found",
        timestamp: new Date().toISOString(),
        function_path: __filename,
        working_directory: process.cwd()
      })
    };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        message: "MongoDB connection failed",
        error: error.message,
        stack: error.stack,
        uri_prefix: sanitizedUri,
        timestamp: new Date().toISOString(),
        function_path: __filename,
        working_directory: process.cwd()
      })
    };
  } finally {
    if (client) {
      try {
        console.log("Closing MongoDB connection");
        await client.close();
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
      }
    }
  }
}; 