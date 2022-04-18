import { Router } from "express";
import { BadRequestException } from "../../common/exceptions/index.js";
import { wrap } from '../../lib/'
import { UserRepository } from "./user.repository";


export default class UserController {
  path = '/users';
  router = Router();

  userService = new this.userService(new UserRepository());

  constructor(){
    this.initalizeRoutes();
  }

  initalizeRoutes() {
    const router = Router();

    router
      .post('/signup', wrap(this.signUp));
    
    this.router.use(this.path, router);
  }

  signUp = async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email) {
      throw new BadRequestException('이메일은 필수입니다.');
    }

    if (!password) {
      throw new BadRequestException('비밀번호는 필수입니다.');
    } else if (password.length < 8) {
      throw new BadRequestException('비밀번호는 최소 8글자 이상입니다.');
    }

    if (!name) {
      throw new BadRequestException('이름은 필수입니다.');
    }

    const { count: hasEmail } = this.userService

  }

}