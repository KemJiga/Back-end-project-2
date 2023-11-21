import { Router } from 'express';
import {
  createUser,
  getUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';

const router = Router();

router.post('/create/', createUser);
router.post('/', getUser);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
