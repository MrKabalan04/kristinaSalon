const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://MrKabalan:mohamad2662004@kristina-nails.u7ql7.mongodb.net/?retryWrites=true&w=majority&appName=kristina-nails";

async function testConnection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB!");
        
        // Test database access
        const db = client.db('kristina-nails');
        const collections = await db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));
        
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    } finally {
        await client.close();
    }
}

testConnection().catch(console.error); 