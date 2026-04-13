require('dotenv').config();
const { getDb, connectToMongo } = require('../mongoConnection');

async function main() {
  await connectToMongo();
  const db = getDb(process.env.MAINDB);
  const vehicleColl = db.collection(process.env.VEHICLESCOLLECTION);

  const argv = require('minimist')(process.argv.slice(2));
  const carId = argv.car || argv.c || '69ca7bf8ea57cbf731545f9c';

  const fieldsToUpdate = {
    brand: 'Honda',
    model: 'Civic',
    year: 2023,
    color: 'Vert',
    plate: 'JKS KSK',
    serialNumber: '6464646646446'
  };

  console.log('Attempting update for', carId, 'with', fieldsToUpdate);
  try {
    const updated = await vehicleColl.findOneAndUpdate(
      { _id: carId },
      { $set: fieldsToUpdate },
      { returnDocument: 'after' }
    );
    console.log('Result:', !!updated, updated && updated.value ? { _id: updated.value._id, plate: updated.value.plate, year: updated.value.year } : null);
  } catch (e) {
    console.error('DB update error:', e);
  }
  process.exit(0);
}

main();
