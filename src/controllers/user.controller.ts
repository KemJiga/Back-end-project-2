import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User, UserInput, UserDocument } from '../models/user.model';
import { UnauthorizedError, getUserFromToken, getIdFromToken } from '../middlewares/jwtAuth';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import * as twoFactor from 'node-2fa';
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
    if (!email || !password) {
      throw new Error('No data provided');
    }
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    } else {
      if ((await comparePassword(user, password)) === false) {
        res.status(403).json({ error: 'Invalid login' });
        return;
      }
      if (user.type === 'Restaurant admin') {
        if (pin) {
          const user_2fa = await UsertwFa.findOne(user._id);
          if (user_2fa) {
            const fa = twoFactor.verifyToken(user_2fa.secret, pin);
            if (!fa) {
              res.status(403).json({ error: 'Invalid login (wrong pin)' });
              return;
            }
          } else {
            res.status(404).json({ error: 'User 2fa not found' });
            return;
          }
        } else {
          res.status(403).json({ error: 'Invalid login (no 2fa pin provided)' });
          return;
        }
      }
      const token = jwt.sign({ _id: user._id }, process.env.MY_SECRET as string, {
        expiresIn: '1d',
      });

      res.status(200).json({ token });
      return;
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function getUserById(req: Request, res: Response) {
  const { _id } = req.params;
  const loggedUserId = await getIdFromToken(req);
  try {
    if (!_id) {
      res.status(400).json({ error: 'No id provided' });
      return;
    }

    const user = await User.findById(_id);
    if (!user || user.deletedAt !== null) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (loggedUserId.toString() !== _id) {
      throw new UnauthorizedError('Unauthorized User');
    }

    res.status(200).json(user);
    return;
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function createUser(req: Request, res: Response) {
  const { name, email, password, phone, type } = req.body;
  try {
    const userInput: UserInput = { name, email, password, phone, type };
    const newUser = await User.create(userInput);
    if (type === 'Restaurant admin') {
      const newSecret = twoFactor.generateSecret({
        name: 'BACK-END-PROJECT-2',
        account: newUser._id,
      });
      const usertwFaInput: UsertwFaInput = { user: newUser._id, secret: newSecret.secret };
      const secretTwfa = await UsertwFa.create(usertwFaInput);
      res.status(201).json({ newUser, secretTwfa });
      return;
    } else {
      res.status(201).json(newUser);
      return;
    }
  } catch (e) {
    if (e instanceof Error) res.status(500).json({ error: e.message });
  }
}

async function deleteUser(req: Request, res: Response) {
  const { _id } = req.params;
  const loggedUserId = await getIdFromToken(req);

  try {
    if (loggedUserId.toString() !== _id) {
      throw new UnauthorizedError('Unauthorized User');
    }

    const user = await User.findOneAndUpdate(
      { _id: _id, deletedAt: null },
      { deletedAt: Date.now() },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    res.status(200).json(user);
    return;
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      res.status(401).json({ error: 'unauthorized user' });
      return;
    }
    res.status(500).json({ error: 'internal error' });
    return;
  }
}

async function updateUser(req: Request, res: Response) {
  const { _id } = req.params;

  const loggedUserId = await getIdFromToken(req);

  try {
    if (loggedUserId.toString() !== _id) {
      throw new UnauthorizedError('Unauthorized User');
    }
    const { name, email, password, phone } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: _id, deletedAt: null },
      { name, email, password, phone, updatedAt: Date.now() },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
    return;;
    }

    res.status(200).json(user);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      res.status(401).json({ error: 'unauthorized user' });
      return;
    }
    res.status(500).json({ error: 'internal error' });
    return;
  }
}

export { getUserById, createUser, deleteUser, updateUser, login };
