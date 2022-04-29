import * as dotenv from 'dotenv';
dotenv.config();

export const jwtSecret = process.env.JWT_SECRET || 'jwt_secret';

export const hashRounds = parseInt(process.env.HASH_ROUNDS || '10', 10);
