
const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = dotenv.config({ path: envPath });

console.log('Dotenv parsed:', result.parsed ? Object.keys(result.parsed) : 'Failed');

if (!process.env.MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

console.log('URI found (length):', process.env.MONGODB_URI.length);

async function main() {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to URI...');
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(); // Use default db from URI
        console.log('Using DB:', db.databaseName);

        const usersCollection = db.collection('users');

        // Find users with no password
        const query = { password: { $exists: false } };
        const count = await usersCollection.countDocuments(query);
        console.log('Users without password:', count);

        if (count > 0) {
            const invalidUsers = await usersCollection.find(query).toArray();
            console.log(`Found ${invalidUsers.length} users without passwords.`);
            invalidUsers.forEach(u => console.log(` - ${u.email} (${u._id})`));

            const deleteResult = await usersCollection.deleteMany(query);
            console.log(`Deleted ${deleteResult.deletedCount} users.`);
        } else {
            console.log('No users to cleanup.');
        }

    } catch (error) {
        console.error('Error in main:', error);
    } finally {
        await client.close();
        console.log('Connection closed.');
    }
}

main().catch(err => console.error('Unhandled:', err));

