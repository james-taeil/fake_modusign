import express, { Router } from 'express';
import session from 'express-session';
import { verifyJWT } from './middlewares/auth.middleware.js';
import { csrf } from './middlewares/csrf.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

class App {
  app;

  constructor(controllers) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  listen() {
    const port = process.env.PORT || 5000;
    this.app.listen(port, () => {
      console.log(`App listening on the port ${port}`);
    });
  }

  getServer() {
    return this.app;
  }

  initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(
      session({
        name: 'prgrms.sid',
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
      }),
    );
    this.app.use(csrf());
    this.app.use(verifyJWT)
  }

  initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  initializeControllers(controllers) {
    const router = Router();

    router.get('/', (req, res) => res.send('OK'));

    controllers.forEach((controller) => {
      router.use(controller.router);
    });

    this.app.use('/api', router);
  }
}

export default App;