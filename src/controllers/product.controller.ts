import { Request, Response } from 'express';
import { UnauthorizedError, getUserFromToken, getIdFromToken } from '../middlewares/jwtAuth';
import { Product, ProductInput } from '../models/product.model';
import { Restaurant } from '../models/restaurant.model';

interface Query {
  deletedAt: null | Date;
  category?: string;
  restaurant?: string;
}

async function createProduct(req: Request, res: Response) {
  const { name, description, price, category, restaurant } = req.body;
  try {
    const rest = await Restaurant.findOne({ _id: restaurant, deletedAt: null });
    if (!rest) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    const loggedUser = await getIdFromToken(req);
    if (!loggedUser) {
      throw new UnauthorizedError('Unauthorized User');
    }
    if (rest.owner.toString() !== loggedUser.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const productInput: ProductInput = { name, description, price, category, restaurant };
    const newProduct = await Product.create(productInput);
    res.status(201).json(newProduct);
    console.log('product added');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getProductById(req: Request, res: Response) {
  const { _id } = req.params;
  try {
    const loggedUser = await getIdFromToken(req);
    if (!loggedUser) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const product = await Product.findById(_id);
    if (!product || product.deletedAt !== null) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(200).json(product);
      console.log('product displayed');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getProducts(req: Request, res: Response) {
  const { category, restaurant } = req.query;
  const query: Query = { deletedAt: null };
  if (category) query.category = category as string;
  if (restaurant) query.restaurant = restaurant as string;
  try {
    const loggedUser = await getIdFromToken(req);
    if (!loggedUser) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const products = await Product.find(query);
    res.status(200).json(products);
    console.log('products displayed');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function deleteProduct(req: Request, res: Response) {
  const { _id } = req.params;
  try {
    const prod = await Product.findOne({ _id: _id, deletedAt: null });
    if (!prod) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const restaurant = prod?.restaurant;
    const rest = await Restaurant.findOne({ _id: restaurant, deletedAt: null });
    if (!rest) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    const loggedUser = await getIdFromToken(req);
    if (!loggedUser) {
      throw new UnauthorizedError('Unauthorized User');
    }
    if (rest.owner.toString() !== loggedUser.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const product = await Product.findOneAndUpdate(
      { _id: _id, deletedAt: null },
      { deleteAt: Date.now() },
      {
        new: true,
      }
    );

    res.status(200).json(product);
    console.log('product deleted');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function updateProduct(req: Request, res: Response) {
  const { _id } = req.params;
  const { name, price, category, deletedAt } = req.body;
  const update = { name, price, category, deletedAt, updatedAt: Date.now() };

  if (!(name || price || category || deletedAt)) {
    res.status(400).json({ error: 'No parameters to update provided' });
  }
  try {
    const prod = await Product.findOne({ _id: _id, deletedAt: null });
    if (!prod) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const restaurant = prod?.restaurant;
    const rest = await Restaurant.findOne({ _id: restaurant, deletedAt: null });
    if (!rest) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    const loggedUser = await getIdFromToken(req);
    if (!loggedUser) {
      throw new UnauthorizedError('Unauthorized User');
    }
    if (rest.owner.toString() !== loggedUser.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }

    const product = await Product.findOneAndUpdate({ _id: _id, deletedAt: null }, update, {
      new: true,
    });

    res.status(200).json(product);
    console.log('product updated');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

export { createProduct, getProductById, getProducts, deleteProduct, updateProduct };
