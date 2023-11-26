import { Router } from 'express';
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  login,
} from '../controllers/user.controller';

const router = Router();

router.post('/create/', createUser);
router.post('/', login);
router.get('/:_id', getUserById);
router.patch('/:_id', updateUser);
router.delete('/:_id', deleteUser);

export default router;
