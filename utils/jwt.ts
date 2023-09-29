import { User } from '@prisma/client';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { UserPayload } from '../types/user-payload';

const getUserPayload = async (user: User): Promise<UserPayload> => {
  return {
    ...user,
  };
};

const createToken = async (userPayload: UserPayload): Promise<string> => {
  const token = await new SignJWT({ ...userPayload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '30d')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET as string));
  return token;
};

const verifyToken = async (token: string): Promise<JWTPayload> => {
  const userPayload = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SECRET as string)
  );
  console.log(userPayload);

  return userPayload.payload;
};

export { getUserPayload, createToken, verifyToken };
