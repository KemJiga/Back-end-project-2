import { Request, Response } from 'express';
import { Order, OrderInput } from '../models/order.model';
import { Restaurant } from '../models/restaurant.model';
import { Product } from '../models/product.model';
import mongoose, { Schema } from 'mongoose';

interface Query {
  deletedAt: null | Date;
  user?: string;
  restaurant?: string;
  status?: string; // Replace with the actual type of status
  createdAt?: { $gte: Date; $lte: Date };
}

async function createOrder(req: Request, res: Response) {
  var total = 0;
  const { user, restaurant, products } = req.body;
  const update = { $inc: { popularity: 1 }, updatedAt: Date.now() };
  try {
    const rest = await Restaurant.findByIdAndUpdate(restaurant, update);
    if (!rest) {
      res.status(404).json({ error: 'Restaurant not found' });
    } else {
      await Promise.all(
        products.map(async (p: [Schema.Types.ObjectId, number]) => {
          try {
            const orderProduct = await Product.findById(p[0]);
            if (orderProduct) total += orderProduct.price * p[1];
          } catch (e) {
            if (e instanceof Error) res.status(500).json({ error: e.message });
          }
          console.log(total);
        })
      );
      console.log('final ' + total);
      const newOrder = new Order({
        user,
        restaurant,
        products: new Map(products),
        total,
        status: 'Created',
      });
      await newOrder.save();
      res.status(201).json(newOrder);
      console.log('order added');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getOrderById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order || order.deletedAt !== null) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      res.status(200).json(order);
      console.log('Order displayed');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getCreatedOrders(req: Request, res: Response) {
  try {
    const orders = await Order.find({ status: 'Created', deletedAt: null });
    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      res.status(200).json(orders);
      console.log('Order displayed');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getFilteredOrders(req: Request, res: Response) {
  const { user, restaurant, status, startDate, finishDate } = req.query;
  const query: Query = { deletedAt: null };
  if (user) query.user = user as string;
  if (restaurant) query.restaurant = restaurant as string;
  if (status) query.status = status as string;
  if (startDate && finishDate)
    query.createdAt = { $gte: new Date(startDate as string), $lte: new Date(finishDate as string) };
  console.log(query);
  try {
    const orders = await Order.find(query);
    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      res.status(200).json(orders);
      console.log('Order displayed');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function updateOrder(req: Request, res: Response) {
  const { id } = req.params;
  const { products, status } = req.body;
  try {
    const order = await Order.findById(id);
    if (!order || order.deletedAt !== null) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      if (order.status !== 'Sended' && order.status != 'Delivered') {
        const updatedOrder = await Order.findByIdAndUpdate(id, { products, status, updatedAt: Date.now() }, { new: true });
        res.status(200).json(updatedOrder);
        console.log('Order updated');
      } else {
        res.status(400).json({ error: 'Order can not be updated' });
      }
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function deleteOrder(req: Request, res: Response) {
  const { id } = req.params;
  const update = { deletedAt: Date.now(), updatedAt: Date.now() };
  try {
    const deletedOrder = await Order.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      new: true,
    });
    if (!deletedOrder) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      res.status(200).json(deletedOrder);
      console.log('Order deleted');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

export { createOrder, getOrderById, getCreatedOrders, getFilteredOrders, updateOrder, deleteOrder };
