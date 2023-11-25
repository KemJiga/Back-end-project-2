import { Request, Response } from 'express';
import cookieJwtAuth from '../middlewares/cookieJwtAuth';
import { Restaurant, RestaurantInput } from '../models/restaurant.model';

interface Query {
  deletedAt: null | Date;
  name?: { $regex: string; $options: 'i' };
  category?: string;
}

async function createRestaurant(req: Request, res: Response) {
  const { name, category, address } = req.body;
  const auth = cookieJwtAuth.cookieJwtAuth(req, res);
  if (auth) {
    try {
      const restaurantInput: RestaurantInput = { name, category, address };
      const newRestaurant = await Restaurant.create(restaurantInput);
      res.status(201).json(newRestaurant);
      console.log('restaurant added');
    } catch (e) {
      if (e instanceof Error) res.status(500).json({ message: e.message });
    }
  }else{
    res.status(401).json({message: "Unauthorized"});
  }
}

async function getRestaurantById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant || restaurant.deletedAt !== null) {
      res.status(404).json({ error: 'restaurant not found' });
    } else {
      res.status(200).json(restaurant);
      console.log('restaurant found');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getRestaurants(req: Request, res: Response) {
  const { name, category } = req.query;
  const query: Query = { deletedAt: null };
  if (name) query.name = { $regex: name as string, $options: 'i' };
  if (category) query.category = category as string;
  console.log(query);
  try {
    const restaurants = await Restaurant.find(query).sort({ popularity: -1 });
    if (restaurants.length === 0) {
      res.status(404).json({ error: 'restaurant not found' });
    } else {
      res.status(200).json(restaurants);
      console.log('restaurants displayed');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function deleteRestaurant(req: Request, res: Response) {
  const { id } = req.params;
  const update = { deletedAt: Date.now(), updatedAt: Date.now() };
  try {
    const restaurant = await Restaurant.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      new: true,
    });
    if (!restaurant) {
      res.status(404).json({ error: 'restaurant not found' });
    } else {
      res.status(200).json(restaurant);
      console.log('restaurant deleted');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function updateRestaurant(req: Request, res: Response) {
  const { id } = req.params;
  const { name, category, popularity, address } = req.body;
  const update = { name, category, popularity, address, updatedAt: Date.now() };
  try {
    const restaurant = await Restaurant.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      new: true,
    });
    if (!restaurant) {
      res.status(404).json({ error: 'restaurant not found' });
    } else {
      res.status(200).json(restaurant);
      console.log('restaurant updated');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

export { createRestaurant, getRestaurantById, getRestaurants, deleteRestaurant, updateRestaurant };
