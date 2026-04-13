require('dotenv').config();
const { connectToMongo, getDb } = require('../mongoConnection');
(async () => {
  await connectToMongo();
  const db = getDb(process.env.MAINDB);
  const coll = db.collection(process.env.VEHICLESCOLLECTION);
  const carId = '69ca7bf8ea57cbf731545f9c';
  try {
    const res = await coll.findOneAndUpdate({ _id: carId }, { $set: { ownerInfo: { firstName: 'Cunningham', lastName: 'Li' } } }, { returnDocument: 'after' });
    console.log('Updated:', res && res.value);
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
})();
