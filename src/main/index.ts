import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import mongoose, { ConnectOptions } from 'mongoose';
import userRouter from '../routes/user.routes';
import restaurantRouter from '../routes/restaurant.routes';
import productRouter from '../routes/product.routes';
import orderRouter from '../routes/order.routes';

// Function to connect to database due to top-level await restrictions in es2016
const connectdb = async () => {
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

// Environment variables
dotenv.config();
const PORT = process.env.PORT || '3000';
const MONGO_URI = process.env.MONGO_URI;

// Settings
const app = express();
app.set('port', PORT);
app.set('json spaces', 2);

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// Endpoint for 404 error
app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

// Starting the server
try {
  app.listen(app.get('port'), () => {
    console.log(`Server is running on port ${app.get('port')}`);
  });
} catch (e) {
  if (typeof e === 'string') {
    console.log(e.toUpperCase()); // works, `e` narrowed to string
  } else if (e instanceof Error) {
    console.log(e.message); // works, `e` narrowed to Error
  }
}

// Connecting to database
connectdb();
