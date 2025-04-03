const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://MrKabalan:mohamad2662004@kristina-nails.u7ql7.mongodb.net/?retryWrites=true&w=majority&appName=kristina-nails";

async function initializeDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        
        const db = client.db('kristina-nails');
        const collection = db.collection('data');
        
        // Check if data already exists
        const existingData = await collection.findOne({ _id: 'main-data' });
        
        if (existingData) {
            console.log("Data already exists in database");
        } else {
            // Initial data
            const initialData = {
                _id: 'main-data',
                services: [],
                categories: [],
                credentials: {
                    username: 'admin',
                    password: 'admin'
                }
            };
            
            await collection.insertOne(initialData);
            console.log("Initial data inserted successfully!");
        }
        
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
    }
}

initializeDatabase().catch(console.error); 