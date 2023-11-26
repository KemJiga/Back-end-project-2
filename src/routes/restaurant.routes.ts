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
router.get('/:_id', getRestaurantById);
router.post('/', createRestaurant);
router.delete('/:_id', deleteRestaurant);
router.patch('/:_id', updateRestaurant);

export default router;
