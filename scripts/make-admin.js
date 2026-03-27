require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function makeAdmin(email) {
  if (!email) {
    console.error("❌ Please provide an email address.");
    console.error("Usage: node scripts/make-admin.js <your-email>");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log(`Connecting to MongoDB...`);
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('users');

    console.log(`Searching for user with email: ${email}...`);
    const result = await collection.updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
        console.log(`❌ No user found with email: ${email}`);
    } else {
        console.log(`✅ Successfully added the 'role' field and made ${email} an admin!`);
        console.log(`Please log out and log back in to your application to see the changes.`);
    }
  } catch (error) {
    console.error("Database Error:", error);
  } finally {
    await client.close();
  }
}

makeAdmin(process.argv[2]);
