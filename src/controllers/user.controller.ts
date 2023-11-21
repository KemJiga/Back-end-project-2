import { Request, Response } from 'express';
import { User, UserInput } from '../models/user.model';
import crypto from 'crypto';

const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return crypto.pbkdf2Sync(password, salt, 100, 64, `sha512`).toString(`hex`);
};

async function getUser(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await User.find({ email, password, deletedAt: null });
    if (user.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(user);
      console.log('user displayed');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user || user.deletedAt !== null) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(user);
      console.log('user displayed by id');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function createUser(req: Request, res: Response) {
  const { name, email, password, phone, type } = req.body;
  try {
    const userInput: UserInput = {
      name,
      email,
      password,
      phone,
      type,
    };
    const newUser = await User.create(userInput);
    res.status(201).json(newUser);
    console.log('user added');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  const update = { deletedAt: Date.now(), updatedAt: Date.now() };
  try {
    const user = await User.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(user);
      console.log('user deleted');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { name, email, password, phone } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { name, email, password, phone, updatedAt: Date.now() },
      {
        new: true,
      }
    );
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(user);
      console.log('user updated');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

export { getUser, getUserById, createUser, deleteUser, updateUser };
