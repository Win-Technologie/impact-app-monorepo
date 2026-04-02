const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
  const uri = process.env.URLDBCONNECTION;
  if (!uri) {
    console.error('URLDBCONNECTION not set');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const admin = client.db().admin();
    const info = await admin.listDatabases();
    console.log('Databases:');
    info.databases.forEach(db => {
      console.log(`- ${db.name}: sizeOnDisk=${db.sizeOnDisk} bytes`);
    });
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
})();
