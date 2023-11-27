import mongoose, { ConnectOptions } from 'mongoose';

// Function to connect to database due to top-level await restrictions in es2016
export const connectdb = async (URI: string) => {
  await mongoose
    .connect(URI!, {
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
