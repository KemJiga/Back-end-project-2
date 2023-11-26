import { Request, Response } from 'express';
import { UnauthorizedError, getUserFromToken, getIdFromToken } from '../middlewares/jwtAuth';
import { Restaurant, RestaurantInput } from '../models/restaurant.model';

interface Query {
  deletedAt: null | Date;
  name?: { $regex: string; $options: 'i' };
  category?: string;
}

async function createRestaurant(req: Request, res: Response) {
  const { name, category, address } = req.body;
  const user = await getUserFromToken(req);
  try {
    const restaurantInput: RestaurantInput = { name, category, address, owner: user._id };
    const newRestaurant = await Restaurant.create(restaurantInput);
    res.status(201).json(newRestaurant);
    console.log('restaurant added');
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ error: 'unauthorized user' });
    }
    res.status(500).json({ error: 'internal error' });
  }
}

async function getRestaurantById(req: Request, res: Response) {
  const { _id } = req.params;
  try {
    const loggedUser = await getUserFromToken(req);
    if (!loggedUser) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const restaurant = await Restaurant.findById(_id);
    if (!restaurant || restaurant.deletedAt !== null) {
      res.status(404).json({ error: 'restaurant not found' });
    } else {
      res.status(200).json(restaurant);
      console.log('restaurant found');
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ error: 'unauthorized user' });
    }
    res.status(500).json({ error: 'internal error' });
  }
}

async function getRestaurants(req: Request, res: Response) {
  const { name, category } = req.query;
  const query: Query = { deletedAt: null };
  if (name) query.name = { $regex: name as string, $options: 'i' };
  if (category) query.category = category as string;
  console.log(query);
  try {
    const loggedUser = await getUserFromToken(req);
    if (!loggedUser) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const restaurants = await Restaurant.find(query).sort({ popularity: -1 });
    if (restaurants.length === 0) {
      res.status(404).json({ error: 'restaurant not found' });
    } else {
      res.status(200).json(restaurants);
      console.log('restaurants displayed');
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ error: 'unauthorized user' });
    }
    res.status(500).json({ error: 'internal error' });
  }
}

async function deleteRestaurant(req: Request, res: Response) {
  const { _id } = req.params;
  try {
    const loggedUser = await getIdFromToken(req);

    const rest = await Restaurant.findOne({ _id: _id, deletedAt: null });

    if (!rest || rest.deletedAt !== null) {
      res.status(404).json({ error: 'restaurant not found' });
    }

    if (rest?.owner.toString() !== loggedUser._id.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: _id, deletedAt: null },
      { deleteAt: Date.now() },
      {
        new: true,
      }
    );

    res.status(200).json(restaurant);
    console.log('restaurant deleted');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function updateRestaurant(req: Request, res: Response) {
  const { _id } = req.params;
  const { name, category, popularity, address } = req.body;
  const update = { name, category, popularity, address, updatedAt: Date.now() };
  try {
    const loggedUser = await getIdFromToken(req);

    const rest = await Restaurant.findOne({ _id: _id, deletedAt: null });

    if (!rest || rest.deletedAt !== null) {
      res.status(404).json({ error: 'restaurant not found' });
    }

    if (rest?.owner.toString() !== loggedUser._id.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }

    const restaurant = await Restaurant.findOneAndUpdate({ _id: _id, deletedAt: null }, update, {
      new: true,
    });

    res.status(200).json(restaurant);
    console.log('restaurant updated');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

export { createRestaurant, getRestaurantById, getRestaurants, deleteRestaurant, updateRestaurant };
