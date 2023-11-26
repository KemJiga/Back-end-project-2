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
router.get('/:_id', getOrderById);
router.get('/', getFilteredOrders);
router.patch('/:_id', updateOrder);
router.delete('/:_id', deleteOrder);

export default router;
