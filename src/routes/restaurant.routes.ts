import { Router } from 'express';
import {
  createRestaurant,
  getRestaurantById,
  getRestaurants,
  deleteRestaurant,
  updateRestaurant,
} from '../controllers/restaurant.controller';

const router = Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.post('/', createRestaurant);
router.delete('/:id', deleteRestaurant);
router.patch('/:id', updateRestaurant);

export default router;
