import { Router } from "express";
import { wrap } from '../../lib/'

export default class UserController {
  path = '/users';
  router = Router();

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
    console.log(req)

  }

}