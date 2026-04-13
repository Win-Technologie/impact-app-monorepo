require('dotenv').config();
const { getDb, connectToMongo } = require('../mongoConnection');

async function main() {
  await connectToMongo();
  const db = getDb(process.env.MAINDB);
  const userColl = db.collection(process.env.USERSCOLLECTION);
  const vehicleColl = db.collection(process.env.VEHICLESCOLLECTION);

  const argv = require('minimist')(process.argv.slice(2));
  const userId = argv.user || argv.u || '69b40bf14272dbcbff01b279';
  const carId = argv.car || argv.c || '69ca7bf8ea57cbf731545f9c';

  console.log('Checking user:', userId);
  const user = await userColl.findOne({ _id: userId });
  console.log('User:', user ? { _id: user._id, vehicles: user.vehicles } : null);

  console.log('Checking vehicle:', carId);
  const car = await vehicleColl.findOne({ _id: carId });
  console.log('Vehicle:', car ? { _id: car._id, plate: car.plate, owner: car.owner } : null);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(2); });
