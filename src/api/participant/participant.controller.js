import { Router } from 'express';
import { wrap } from '../../lib/request-handler.js';
import { ParticipantRepository } from './participant.repository.js';
import { ParticipantService } from './participant.service.js';

export default class ParticipantController {
  path = '/participant';
  router = Router();

  participantService = new ParticipantService(
    new ParticipantRepository(),
  );

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    const router = Router();

    router
      .post('/token', wrap(this.token))
      .get('/document', wrap(this.readDocument))
      .post('/sign', wrap(this.sign));

    this.router.use(this.path, router);
  }

  token = (req, res) => {
    const { documentId, email } = req.body;

    const [token, participant] = this.participantService.issueAccessToken({
      documentId,
      email,
    });

    req.session.email = participant.email;

    return {
      token,
      participant,
    };
  }

  readDocument = (req, res) => {
    throw new Error('Method not implemented.');
  }

  sign = (req, res) => {
    throw new Error('Method not implemented.');
  }
}
