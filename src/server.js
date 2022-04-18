import UserController from './api/users/user.controller'
import App from './app';

const startServer = async () => {
  const app = new App([
    new UserController(),
    // new ParticipantController(),
    // new DocumentController(),
  ]);
  
  app.listen();
}
startServer();  