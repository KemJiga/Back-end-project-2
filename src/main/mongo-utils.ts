import mongoose, { ConnectOptions } from 'mongoose';
const MONGO_URI = process.env.MONGO_URI;

// Function to connect to database due to top-level await restrictions in es2016
export const connectdb = async () => {
  await mongoose
    .connect(MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
    .then(() => {
      console.log('Connected to database.');
    })
    .catch((err) => {
      console.log('There was an error when connecting to the database!');
      console.log(err);
    });
};
