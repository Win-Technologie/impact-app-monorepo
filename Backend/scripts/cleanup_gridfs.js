/*
  Cleanup GridFS files older than a threshold to free Atlas storage.
  Usage:
    node cleanup_gridfs.js --days=30 --delete
  Without --delete it runs in dry-run and lists files to remove.
*/

const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
require('dotenv').config();

const uri = process.env.URLDBCONNECTION;
if (!uri) {
  console.error('URLDBCONNECTION not set in .env');
  process.exit(1);
}

const DAYS_DEFAULT = 30;
const argv = require('minimist')(process.argv.slice(2));
const days = parseInt(argv.days || argv.d || DAYS_DEFAULT, 10);
const doDelete = !!argv.delete || !!argv.dodelete;
const pattern = argv.pattern || argv.p || null;
const excludePattern = argv.exclude || argv.e || null;
const largest = parseInt(argv.largest || argv.L || 0, 10);

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MAINDB || undefined);
    const bucket = new GridFSBucket(db, { bucketName: process.env.GRIDFS_BUCKET_NAME || 'uploads' });

    const filesColl = db.collection((process.env.GRIDFS_BUCKET_NAME || 'uploads') + '.files');

    if (largest && largest > 0) {
      console.log(`Connected. Listing top ${largest} largest GridFS files.`);
      let top = await filesColl.find({}).sort({ length: -1 }).limit(largest).toArray();
      if (excludePattern) {
        try {
          const reEx = new RegExp(excludePattern);
          top = top.filter(f => !reEx.test(f.filename));
          console.log(`Excluding filenames that match: ${excludePattern}`);
        } catch (e) {
          console.log('Invalid exclude pattern; ignoring exclude filter');
        }
      }
      const toDelete = top.map(f => ({ _id: f._id, filename: f.filename, uploadDate: f.uploadDate, length: f.length }));
      console.log(`Found ${toDelete.length} files (largest).`);
      let totalBytes = 0;
      toDelete.forEach(f => totalBytes += (f.length || 0));
      console.log(`Total bytes (these ${toDelete.length} files): ${totalBytes} bytes (~${(totalBytes/1024/1024).toFixed(2)} MB)`);
      toDelete.slice(0, 100).forEach(f => console.log(f));
      if (!doDelete) {
        console.log('Dry-run (largest). Run with --delete to remove these files.');
        process.exit(0);
      }
      // proceed to delete below using same toDelete list
      console.log('Deleting top largest files...');
      for (const f of toDelete) {
        try {
          await bucket.delete(new ObjectId(f._id));
          console.log('Deleted', f._id.toString(), f.filename);
        } catch (e) {
          console.error('Failed to delete', f._id.toString(), e.message || e);
        }
      }
      console.log('Done.');
      process.exit(0);
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    console.log(`Connected. Listing GridFS files older than ${cutoff.toISOString()} (days=${days}). delete=${doDelete}`);

    const query = { uploadDate: { $lt: cutoff } };
    if (pattern) {
      try {
        const re = new RegExp(pattern);
        query.filename = { $regex: re };
        console.log(`Filtering filenames with pattern: ${pattern}`);
      } catch (e) {
        console.log('Invalid pattern provided; ignoring pattern filter');
      }
    }

    const cursor = filesColl.find(query).sort({ uploadDate: 1 });

    const toDelete = [];
    while (await cursor.hasNext()) {
      const f = await cursor.next();
      toDelete.push({ _id: f._id, filename: f.filename, uploadDate: f.uploadDate, length: f.length });
    }

    if (excludePattern) {
      try {
        const reEx = new RegExp(excludePattern);
        const before = toDelete.length;
        toDelete = toDelete.filter(f => !reEx.test(f.filename));
        console.log(`Excluded ${before - toDelete.length} files by exclude pattern: ${excludePattern}`);
      } catch (e) {
        console.log('Invalid exclude pattern; ignoring exclude filter');
      }
    }

    console.log(`Found ${toDelete.length} files older than ${days} days.`);
    let totalBytes = 0;
    toDelete.forEach(f => totalBytes += (f.length || 0));
    console.log(`Total bytes recoverable (approx): ${totalBytes} bytes (~${(totalBytes/1024/1024).toFixed(2)} MB)`);

    if (!doDelete) {
      console.log('Dry-run. Run with --delete to actually remove these files. Example: node cleanup_gridfs.js --days=30 --delete');
      toDelete.slice(0, 100).forEach(f => console.log(f));
      process.exit(0);
    }

    console.log('Deleting files...');
    for (const f of toDelete) {
      try {
        await bucket.delete(new ObjectId(f._id));
        console.log('Deleted', f._id.toString(), f.filename);
      } catch (e) {
        console.error('Failed to delete', f._id.toString(), e.message || e);
      }
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(2);
  } finally {
    await client.close();
  }
})();
