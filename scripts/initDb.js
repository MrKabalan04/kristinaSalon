const { MongoClient } = require('mongodb');
require('dotenv').config();

async function initializeDatabase() {
  console.log("Starting database initialization...");
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set');
  }
  
  let client;
  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB successfully");
    
    const db = client.db('kristina-nails');
    const collection = db.collection('data');
    
    // Check if data already exists
    const existingData = await collection.findOne({ _id: 'main-data' });
    
    if (existingData) {
      console.log("Data already exists in the database. Skipping initialization.");
    } else {
      // Initial data
      const initialData = {
        _id: 'main-data',
        services: [
          {
            name: 'Manicure',
            category: 'Basic Services',
            price: '25$',
            priceType: 'fixed'
          },
          {
            name: 'Pedicure',
            category: 'Basic Services',
            price: '35$',
            priceType: 'fixed'
          },
          {
            name: 'Gel Polish',
            category: 'Basic Services',
            price: '30$',
            priceType: 'fixed'
          }
        ],
        categories: ['Basic Services', 'Nail Art', 'Special Treatments'],
        credentials: {
          username: 'admin',
          password: 'admin'
        }
      };
      
      console.log("Inserting initial data...");
      await collection.insertOne(initialData);
      console.log("Initial data inserted successfully");
    }
    
    console.log("Database initialization completed");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("Database connection closed");
    }
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error in database initialization script:', err);
    process.exit(1);
  });