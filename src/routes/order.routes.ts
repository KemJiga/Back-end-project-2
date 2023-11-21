import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getCreatedOrders,
  getFilteredOrders,
  updateOrder,
  deleteOrder,
} from '../controllers/order.controller';

const router = Router();

router.post('/', createOrder);
router.get('/created/', getCreatedOrders);
router.get('/:id', getOrderById);
router.get('/', getFilteredOrders);
router.patch('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
