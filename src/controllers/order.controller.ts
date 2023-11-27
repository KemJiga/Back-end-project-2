import { Request, Response } from 'express';
import { UnauthorizedError, getUserFromToken, getIdFromToken } from '../middlewares/jwtAuth';
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
  const { restaurant, products } = req.body;
  const updatePopularity = { $inc: { popularity: 1 }, updatedAt: Date.now() };
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const rest = await Restaurant.findByIdAndUpdate(restaurant, updatePopularity);
    if (!rest) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    } else {
      await Promise.all(
        products.map(async (p: [Schema.Types.ObjectId, number]) => {
          try {
            const orderProduct = await Product.findById(p[0]);
            if (orderProduct) total += orderProduct.price * p[1];
          } catch (e) {
            if (e instanceof Error) res.status(500).json({ error: e.message });
          }
        })
      );
      const newOrder = new Order({
        user: user._id as string,
        restaurant,
        products: new Map(products),
        total,
        status: 'Created',
      });
      await newOrder.save();
      res.status(201).json(newOrder);
      return;
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getOrderById(req: Request, res: Response) {
  const { _id } = req.params;
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const order = await Order.findById(_id);
    if (!order || order.deletedAt !== null) {
      res.status(404).json({ error: 'Order not found' });
      return;
    } else {
      res.status(200).json(order);
      return;
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getCreatedOrders(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const orders = await Order.find({ status: 'Created', deletedAt: null });
    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    } else {
      res.status(200).json(orders);
      return;
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getFilteredOrders(req: Request, res: Response) {
  const { restaurant, status, startDate, finishDate } = req.query;
  const query: Query = { deletedAt: null };
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      throw new UnauthorizedError('Unauthorized User');
    }
    if (user) query.user = user._id as string;
    if (restaurant) query.restaurant = restaurant as string;
    if (status) query.status = status as string;
    if (startDate && finishDate)
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(finishDate as string),
      };
    const orders = await Order.find(query);
    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    } else {
      res.status(200).json(orders);
      return;
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function updateOrder(req: Request, res: Response) {
  const { _id } = req.params;
  const { products, status } = req.body;
  if (!(products || status)) {
    res.status(400).json({ error: 'No parameters to update provided' });
    return;
  }
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const order = await Order.findById(_id);
    if (!order || order.deletedAt !== null) {
      res.status(404).json({ error: 'Order not found' });
      return;
    } else {
      if (order.status !== 'Sended' && order.status != 'Delivered') {
        const updatedOrder = await Order.findByIdAndUpdate(
          _id,
          { products, status, updatedAt: Date.now() },
          { new: true }
        );
        res.status(200).json(updatedOrder);
        return;
      } else {
        res.status(400).json({ error: 'Order can not be updated' });
        return;
      }
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function deleteOrder(req: Request, res: Response) {
  const { _id } = req.params;
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const ord = await Order.findOne({ _id: _id, deletedAt: null });
    if (!ord) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (user._id.toString() !== ord?.user.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const deletedOrder = await Order.findOneAndUpdate(
      { _id: _id, deletedAt: null },
      { deletedAt: Date.now() },
      {
        new: true,
      }
    );
    res.status(200).json(deletedOrder);
    return;
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

export { createOrder, getOrderById, getCreatedOrders, getFilteredOrders, updateOrder, deleteOrder };
