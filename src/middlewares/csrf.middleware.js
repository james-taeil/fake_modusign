import Tokens from 'csrf';

export const CSRF_TOKEN_HEADER = 'x-csrf-token';

const ignorePaths = ['/api'];
const tokens = new Tokens();

export const csrf = () => (req, res, next) => {
  next();
};
