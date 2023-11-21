import { Request, Response } from 'express';
import { Product, ProductInput } from '../models/product.model';

interface Query {
  deletedAt: null | Date;
  category?: string;
  restaurant?: string;
}

async function createProduct(req: Request, res: Response) {
  const { name, description, price, category, restaurant } = req.body;
  try {
    const productInput: ProductInput = { name, description, price, category, restaurant };
    const newProduct = await Product.create(productInput);
    res.status(201).json(newProduct);
    console.log('product added');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getProductById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
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
    const products = await Product.find(query);
    res.status(200).json(products);
    console.log('products displayed');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  const update = { deletedAt: Date.now(), updatedAt: Date.now() };
  try {
    const product = await Product.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      new: true,
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(200).json(product);
      console.log('product deleted');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const { name, price, category, deletedAt } = req.body;
  const update = { name, price, category, deletedAt, updatedAt: Date.now() };
  try {
    const product = await Product.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      new: true,
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(200).json(product);
      console.log('product updated');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

export { createProduct, getProductById, getProducts, deleteProduct, updateProduct };
