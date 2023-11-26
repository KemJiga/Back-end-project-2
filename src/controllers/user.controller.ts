import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User, UserInput, UserDocument } from '../models/user.model';
import { UnauthorizedError, getUserFromToken } from '../middlewares/jwtAuth';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import twoFactor from 'node-2fa';
import { UsertwFa, UsertwFaInput, UsertwFaDocument } from '../models/2fa.model';

dotenv.config();

function comparePassword(user: UserDocument, candidatePassword: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
}

async function login(req: Request, res: Response) {
  const { email, password, pin } = req.body;
  try {
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      if ((await comparePassword(user, password)) === false) {
        res.status(403).json({ error: 'Invalid login' });
      }
      if (user.type === 'Restaurant admin') {
        if (pin) {
          const user_2fa = await UsertwFa.findOne(user._id);
          if (user_2fa) {
            const fa = twoFactor.verifyToken(user_2fa.secret, pin);
            if (!fa) res.status(403).json({ error: 'Invalid login (wrong pin)' });
          } else {
            res.status(404).json({ error: 'User 2fa not found' });
          }
        } else {
          res.status(403).json({ error: 'Invalid login (no 2fa pin provided)' });
        }
      }
      const token = jwt.sign({ _id: user._id }, process.env.MY_SECRET as string, {
        expiresIn: '1d',
      });

      console.log(token);
      res.status(200).json({ token });
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getUserById(req: Request, res: Response) {
  const { _id } = req.params;
  const loggedUser = await getUserFromToken(req);

  try {
    const user = await User.findById(_id);
    if (!user || user.deletedAt !== null) {
      throw new Error('User not found');
    }
    if (loggedUser._id.toString() !== user?._id.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }
    res.status(200).json(user);
    console.log('user displayed by id');
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
    if (type === 'Restaurant admin') {
      const newSecret = twoFactor.generateSecret({
        name: 'BACK-END-PROJECT-2',
        account: newUser._id,
      });
      const usertwFaInput: UsertwFaInput = { user: newUser._id, secret: newSecret.secret };
      const secretTwfa = await UsertwFa.create(usertwFaInput);
      res.status(201).json({ newUser, secretTwfa });
    }
    res.status(201).json(newUser);
    console.log('user added');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function deleteUser(req: Request, res: Response) {
  const { _id } = req.params;
  const loggedUser = await getUserFromToken(req);

  const searchedUser = await User.findById(_id);
  try {
    if (!searchedUser) {
      throw new Error('User not found');
    }

    if (loggedUser._id.toString() !== searchedUser?._id.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }

    const user = await User.findOneAndUpdate(
      { _id: _id, deletedAt: null },
      { deletedAt: Date.now() },
      { new: true }
    );

    res.status(200).json(user);
    console.log('user deleted');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function updateUser(req: Request, res: Response) {
  const { _id } = req.params;
  const loggedUser = await getUserFromToken(req);
  const searchedUser = await User.findById(_id);

  try {
    if (!searchedUser || searchedUser.deletedAt !== null) {
      throw new Error('User not found');
    }

    if (loggedUser._id.toString() !== searchedUser?._id.toString()) {
      throw new UnauthorizedError('Unauthorized User');
    }

    const { name, email, password, phone } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: _id, deletedAt: null },
      { name, email, password, phone, updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json(user);
    console.log('user updated');
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

export { getUserById, createUser, deleteUser, updateUser, login };
