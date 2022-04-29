import { UnauthorizedException } from '../common/exceptions/index.js';
import { verify } from '../lib/jwt.js';

export const verifyJWT = (req, res, next) => {
  const bearerToken = req.headers['authorization'];

  if (bearerToken) {
    try {
      const token = bearerToken.replace(/^Bearer /, '');
      const decoded = verify(token);

      next();
    } catch (err) {
      next(new UnauthorizedException());
    }
  } else {
    next();
  }
};
