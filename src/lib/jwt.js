import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';

export function sign(payload, options) {
  return jwt.sign(payload, jwtSecret, {
    algorithm: 'HS256',
    expireIn: '1d',
    ...options,
  });
}

export function verify(token, options) {
  return jwt.verify(token, jwtSecret, options);
}