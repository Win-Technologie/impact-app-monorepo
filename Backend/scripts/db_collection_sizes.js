const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
  const uri = process.env.URLDBCONNECTION;
  if (!uri) {
    console.error('URLDBCONNECTION not set');
    process.exit(1);
  }
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const dbName = process.env.MAINDB || 'test';
    const db = client.db(dbName);
    console.log(`Connected to ${dbName}`);

    const collNames = await db.listCollections().toArray();
    for (const c of collNames) {
      try {
        const stats = await db.command({ collStats: c.name });
        console.log(`Collection: ${c.name}`);
        console.log(`  count: ${stats.count}`);
        console.log(`  size bytes: ${stats.size}`);
        console.log(`  storageSize bytes: ${stats.storageSize}`);
        console.log(`  totalIndexSize bytes: ${stats.totalIndexSize}`);
      } catch (e) {
        console.error(' Failed to get stats for', c.name, e.message || e);
      }
    }
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await client.close();
  }
})();
