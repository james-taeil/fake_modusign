import express, { Router } from 'express';
import session from 'express-session';
import cors from 'cors';

class App {
  app;

  constructor(controllers) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers)
  }

  // running server port : 3000
  listen() {
    const port = process.env.PORT || 3000;
    this.app.listen(port, () => {
      console.log(`App listening on the port ${port}`);
    });
  }

  // running express fw
  getServer() {
    return this.app;
  }

  initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(
      cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })

    )
  }

  initializeControllers(controllers) {
    const router = Router();
    router.get('/', (req, res) => res.send('OK'))

    controllers.forEach((controller) => {
      router.use(controller.router)
    })

    this.app.use('/api', router)
  }
}

export default App;