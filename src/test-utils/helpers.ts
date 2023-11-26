import mongoose from 'mongoose';

export async function clearCollections() {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map(async (collection) => {
      await collection.deleteMany({}); // an empty mongodb selector object ({}) must be passed as the filter argument
    })
  );
}

export async function mongoDisconnect() {
  await mongoose.disconnect();
}
