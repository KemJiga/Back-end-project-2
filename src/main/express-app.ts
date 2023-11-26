import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import userRouter from '../routes/user.routes';
import restaurantRouter from '../routes/restaurant.routes';
import productRouter from '../routes/product.routes';
import orderRouter from '../routes/order.routes';

// Environment variables
dotenv.config();
const PORT = process.env.PORT || '3000';

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

export { app };
