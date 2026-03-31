#!/usr/bin/env node
require('dotenv').config();
const { connectToMongo, getDb } = require('../mongoConnection');
const fs = require('fs');
const path = require('path');
const { GridFSBucket, ObjectId } = require('mongodb');

async function walkDir(dir) {
  const results = [];
  const list = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDir(full)));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

function parseUserIdFromFilename(filename) {
  // Expect filenames like <userId>_... or <userId>-...; return null if not found
  const base = path.basename(filename);
  const parts = base.split('_');
  if (parts.length > 1) return parts[0];
  const parts2 = base.split('-');
  if (parts2.length > 1) return parts2[0];
  return null;
}

async function uploadFileToGridFS(bucket, filePath, filename, userId, dryRun) {
  if (dryRun) return { simulated: true };
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { userId, originalPath: filePath },
    });
    readStream.pipe(uploadStream)
      .on('error', (err) => reject(err))
      .on('finish', () => resolve(uploadStream.id.toString()));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  const doDelete = args.includes('--delete') || args.includes('-d');

  console.log(`Migration to GridFS started. dryRun=${dryRun} deleteAfter=${doDelete}`);

  await connectToMongo();
  const db = getDb(process.env.MAINDB);
  const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  const userCollection = db.collection(process.env.USERSCOLLECTION);
  const dlCollection = db.collection(process.env.DRIVERSLICENSECOLLECTION);

  const candidateDirs = [];
  if (process.env.USER_ROUTER_IMG_PROFILE_PATH) candidateDirs.push(process.env.USER_ROUTER_IMG_PROFILE_PATH);
  if (process.env.USER_ROUTER_IMG_IDS_PATH) candidateDirs.push(process.env.USER_ROUTER_IMG_IDS_PATH);
  if (process.env.USER_ROUTER_IMG_PATH) candidateDirs.push(process.env.USER_ROUTER_IMG_PATH);

  const existingDirs = candidateDirs.filter((d) => {
    try { return fs.existsSync(d) && fs.statSync(d).isDirectory(); } catch (e) { return false; }
  });

  if (existingDirs.length === 0) {
    console.error('No upload directories found. Check env variables USER_ROUTER_IMG_PROFILE_PATH, USER_ROUTER_IMG_IDS_PATH, USER_ROUTER_IMG_PATH');
    process.exit(1);
  }

  const summary = { scanned: 0, uploaded: 0, skipped: 0, errors: 0 };

  for (const dir of existingDirs) {
    console.log('Scanning', dir);
    const files = await walkDir(dir);
    for (const filePath of files) {
      summary.scanned++;
      const filename = path.basename(filePath);
      const guessedUserId = parseUserIdFromFilename(filename);

      let user = null;
      if (guessedUserId) {
        user = await userCollection.findOne({ _id: guessedUserId });
      }

      // If not found by filename, try to find a user referencing this path
      if (!user) {
        // Try absolute match
        user = await userCollection.findOne({ profileImagePath: filePath });
      }
      if (!user) {
        // Try filename contained in profileImagePath
        user = await userCollection.findOne({ profileImagePath: { $regex: filename } });
      }

      if (user) {
        try {
          // Decide target type by directory name or filename
          const isProfile = dir === process.env.USER_ROUTER_IMG_PROFILE_PATH || filename.toLowerCase().includes('profile') || dir.toLowerCase().includes('profile');
          const isId = dir === process.env.USER_ROUTER_IMG_IDS_PATH || filename.toLowerCase().includes('selfie') || filename.toLowerCase().includes('front') || filename.toLowerCase().includes('back');

          if (isProfile) {
            console.log(`Uploading profile file for user ${user._id}: ${filename}`);
            const fileId = await uploadFileToGridFS(bucket, filePath, filename, user._id, dryRun);
            if (!dryRun) {
              await userCollection.updateOne({ _id: user._id }, { $set: { profileImagePath: `user/profile-image/${fileId}`, profileImageId: fileId } });
            }
            summary.uploaded++;
            if (doDelete && !dryRun) fs.unlinkSync(filePath);
            continue;
          }

          if (isId) {
            // determine type token
            const parts = filename.split('_');
            const typeToken = parts[1] ? parts[1].toLowerCase() : null;
            let fieldMap = null;
            if (typeToken && typeToken.includes('selfie')) fieldMap = { pathField: 'photoSelfie', idField: 'photoSelfieId' };
            else if (typeToken && (typeToken.includes('front') || typeToken.includes('recto'))) fieldMap = { pathField: 'photoRecto', idField: 'photoRectoId' };
            else if (typeToken && (typeToken.includes('back') || typeToken.includes('verso'))) fieldMap = { pathField: 'photoVerso', idField: 'photoVersoId' };

            if (!fieldMap) {
              console.log(`Skipping id file (unknown type): ${filePath}`);
              summary.skipped++;
              continue;
            }

            console.log(`Uploading driving-licence file for user ${user._id} (${fieldMap.pathField}): ${filename}`);
            const fileId = await uploadFileToGridFS(bucket, filePath, filename, user._id, dryRun);
            if (!dryRun) {
              const publicPath = `user/driving-licence-photo/${fileId}`;
              const update = { $set: {} };
              update.$set[fieldMap.pathField] = publicPath;
              update.$set[fieldMap.idField] = fileId;
              await dlCollection.updateOne({ user: user._id }, update, { upsert: true });
            }
            summary.uploaded++;
            if (doDelete && !dryRun) fs.unlinkSync(filePath);
            continue;
          }

          // Unknown type: skip
          console.log(`Skipping unknown file type for user ${user._id}: ${filePath}`);
          summary.skipped++;
        } catch (err) {
          console.error('Error processing file', filePath, err.message || err);
          summary.errors++;
        }
      } else {
        console.log('No user found for file, skipping:', filePath);
        summary.skipped++;
      }
    }
  }

  console.log('Migration summary:', summary);
  process.exit(0);
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(2);
});
