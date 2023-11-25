import jwt from "jsonwebtoken";
import { Request, Response } from 'express';
import { User, UserInput, UserDocument } from '../models/user.model';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

function comparePassword(user: UserDocument, candidatePassword: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};

async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      if (await comparePassword(user, password) === false) {
        res.status(403).json({ error: 'Invalid login' });
      }

      //delete user.password;
      const token = jwt.sign({ _id: user._id }, process.env.MY_SECRET as string, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true });

      console.log(token);
      res.status(200).json(user);
      console.log('user displayed');
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

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
    console.log('this is running on typescript');
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

export { getUser, getUserById, createUser, deleteUser, updateUser, login };
