import { Router } from 'express';
import { BadRequestException } from '../../common/exceptions/index.js';
import { wrap } from '../../lib/request-handler.js';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

export default class UserController {
  path = '/users';
  router = Router();

  userService = new UserService(new UserRepository());

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    const router = Router();

    router
      .post('/signup', wrap(this.signUp))
      .post('/login', wrap(this.login))
      .get('/me', wrap(this.me));

    this.router.use(this.path, router);
  }

  signUp = async (req, res) => {
    const { email, password, name } = req.body;

    if (!email) {
      throw new BadRequestExceptiotun('이메일은 필수입니다.');
    }

    if (!password) {
      throw new BadRequestException('비밀번호는 필수입니다.');
    } else if (password.length < 8) {
      throw new BadRequestException('비밀번호는 최소 8글자 이상입니다.');
    }

    if (!name) {
      throw new BadRequestException('이름은 필수입니다.');
    }

    const { count: hasEmail } = this.userService.countByEmail(email);
    if (hasEmail) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    await this.userService.signUp({
      email,
      password,
      name,
    });

    return true;
  }

  login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      throw new BadRequestException('이메일은 필수입니다.');
    }

    if (!password) {
      throw new BadRequestException('비밀번호는 필수입니다.');
    } else if (password.length < 8) {
      throw new BadRequestException('비밀번호는 최소 8글자 이상입니다.');
    }

    const [token, user] = await this.userService.login({ email, password });

    req.session.email = email;

    return {
      token,
      user,
    };
  };

  me = (req, res) => {
    const email = req.session.email;
    const user = this.userService.findByEmail(email);

    return { user: user.toJson() };
  };
}