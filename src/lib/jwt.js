import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config.js';

export const sign = (payload, options) => {
  return jwt.sign(payload, jwtSecret, {
    algorithm: 'HS256',
    expireIn: '1d',
    ...options,
  });
}

export const verify = (token, options) => {
  return jwt.verify(token, jwtSecret, options);
}