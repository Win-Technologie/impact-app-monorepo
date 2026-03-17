// Script to view and clean up vehicles in the database
require('dotenv').config();
const { connectToMongo, getDb } = require('./mongoConnection.js');

async function debugVehicles() {
  try {
    await connectToMongo();
    const db = getDb('impactdb');
    const vehicleCollection = db.collection('vehicles');
    
    console.log('\n=== ALL VEHICLES IN DATABASE ===\n');
    const allVehicles = await vehicleCollection.find({}).toArray();
    
    if (allVehicles.length === 0) {
      console.log('No vehicles found in database.');
    } else {
      allVehicles.forEach((vehicle, index) => {
        console.log(`\n--- Vehicle ${index + 1} ---`);
        console.log('ID:', vehicle._id);
        console.log('Brand:', vehicle.brand || 'N/A');
        console.log('Model:', vehicle.model || 'N/A');
        console.log('Year:', vehicle.year || 'N/A');
        console.log('Color:', vehicle.color || 'N/A');
        console.log('Plate:', vehicle.plate || 'N/A');
        console.log('Serial Number:', vehicle.serialNumber || 'N/A');
        console.log('Owner:', vehicle.owner || 'N/A');
        console.log('Has Immatriculation:', !!vehicle.immatriculation);
      });
      
      console.log(`\n\nTotal vehicles: ${allVehicles.length}`);
      
      // Find vehicles with missing data
      const invalidVehicles = allVehicles.filter(v => 
        !v.brand || !v.model || !v.year || !v.color || !v.plate || !v.serialNumber
      );
      
      if (invalidVehicles.length > 0) {
        console.log('\n\n=== INVALID VEHICLES (missing data) ===\n');
        invalidVehicles.forEach(v => {
          console.log(`ID: ${v._id} - Brand: ${v.brand || 'MISSING'}, Model: ${v.model || 'MISSING'}`);
        });
        
        console.log('\n\nTo delete invalid vehicles, uncomment the deletion code below and run this script again.');
        
        // UNCOMMENT TO DELETE INVALID VEHICLES:
        // const deleteResult = await vehicleCollection.deleteMany({
        //   $or: [
        //     { brand: { $exists: false } },
        //     { brand: null },
        //     { brand: '' },
        //     { model: { $exists: false } },
        //     { model: null },
        //     { model: '' }
        //   ]
        // });
        // console.log(`\nDeleted ${deleteResult.deletedCount} invalid vehicles.`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugVehicles();
