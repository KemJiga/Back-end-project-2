import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import { User } from '../models/user.model';

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

function getJWTTokenFromHeader(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
    return authHeader.split(' ')[1];
  }
  return null;
}

async function getUserFromToken(req: Request): Promise<any> {
  try {
    const token = getJWTTokenFromHeader(req);
    if (token) {
      const MY_SECRET = process.env.MY_SECRET;
      const jwtPayload = jwt.verify(token, MY_SECRET as string);
      //TODO: improve type checking
      const _id = (jwtPayload as JwtPayload)._id;
      // find user by id and deletedAt == null
      const user = await User.findOne({ _id, deletedAt: null });
      if (!user) {
        throw new UnauthorizedError('Unauthorized User');
      }
      return user;
    }
  } catch (error) {
    throw new UnauthorizedError('Unauthorized User');
  }
}

export { getJWTTokenFromHeader, getUserFromToken, UnauthorizedError };
