import DocumentController from './api/documents/document.controller.js';
import ParticipantController from './api/participant/participant.controller.js';
import UserController from './api/users/user.controller.js';
import App from './app.js';
import { initializeDatabase } from './lib/database.js';

async function startServer() {
  await initializeDatabase(':memory:');

  const app = new App([
    new UserController(),
    new ParticipantController(),
    new DocumentController(),
  ]);

  app.listen();
}
startServer();
