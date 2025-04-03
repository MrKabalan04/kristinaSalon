const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  console.log("Testing MongoDB connection...");
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("ERROR: MONGODB_URI environment variable is not set!");
    process.exit(1);
  }
  
  console.log("Connection string:", uri.substring(0, uri.indexOf(':')) + ':****@' + uri.substring(uri.indexOf('@') + 1));
  
  let client = null;
  try {
    // Using older connection parameters that are compatible with any MongoDB version
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    
    // Test database access
    const db = client.db('kristina-nails');
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    const collection = db.collection('data');
    const doc = await collection.findOne({ _id: 'main-data' });
    
    if (doc) {
      console.log("Document found! Data verified.");
      console.log("Document contains:", Object.keys(doc));
    } else {
      console.log("Document 'main-data' not found.");
      console.log("Inserting test document...");
      
      const testData = {
        _id: 'main-data',
        services: [],
        categories: ['Uncategorized'],
        credentials: { username: 'admin', password: 'admin' }
      };
      
      await collection.insertOne(testData);
      console.log("Test document inserted successfully!");
    }
    
    console.log("MongoDB connection test successful!");
  } catch (error) {
    console.error("ERROR connecting to MongoDB:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    if (client) {
      console.log("Closing connection...");
      await client.close();
      console.log("Connection closed.");
    }
  }
}

testConnection()
  .then(() => {
    console.log("Connection test completed successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection test failed:", err);
    process.exit(1);
  }); 