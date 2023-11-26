import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
} from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);
router.get('/:_id', getProductById);
router.post('/', createProduct);
router.delete('/:_id', deleteProduct);
router.patch('/:_id', updateProduct);

export default router;
