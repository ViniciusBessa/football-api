import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/user-payload';

const getUserPayload = async (user: User): Promise<UserPayload> => {
  return {
    ...user,
  };
};

const createToken = async (userPayload: UserPayload): Promise<string> => {
  const token = jwt.sign(userPayload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
  return token;
};

const verifyToken = async (token: string): Promise<UserPayload> => {
  const userPayload = jwt.verify(token, process.env.JWT_SECRET as string);
  return userPayload as UserPayload;
};

export { getUserPayload, createToken, verifyToken };
