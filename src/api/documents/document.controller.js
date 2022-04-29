import { Router } from 'express';
import { BadRequestException } from '../../common/exceptions/index.js';
import { wrap } from '../../lib/request-handler.js';

export default class DocumentController {
  path = '/documents';
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    const router = Router();

    router
      .post('/', wrap(this.create))
      .get('/', wrap(this.findAll))
      .get('/:documentId', wrap(this.findOne))
      .delete('/:documentId', wrap(this.remove))
      .post('/:documentId/publish', wrap(this.publish));

    this.router.use(this.path, router);
  }
  
  create = (req, res) => {
    const { title, content, participants } = req.body;
    console.log(req.session.id)
    if (!title) throw new BadRequestException('제목은 필수입니다.');

    if (!content) throw new BadRequestException('내용은 필수입니다.');

    if (participants.length < 2 || participants.length > 10) {
      throw new BadRequestException('참가자는 최소 2명, 최대 10명입니다.') 
    }

    const userId = req.session.id;

    
    
    throw new Error('Method not implemented.');
  }

  findOne = (req, res) => {
    throw new Error('Method not implemented.');
  }

  findAll = (req, res) => {
    throw new Error('Method not implemented.');
  }

  publish = (req, res) => {
    throw new Error('Method not implemented.');
  }

  remove = (req, res) => {
    throw new Error('Method not implemented.');
  }
}
