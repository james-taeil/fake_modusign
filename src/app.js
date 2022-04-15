import express from 'express';

class App {
  app;

  constructor(controller) {
    this.app = express();
  }

  // running server port : 5000
  listen() {
    const port = process.env.PORT || 5000;
    this.app.listen(port, () => {
      console.log(`App listening on the port ${port}`);
    });
  }

  // running express fw
  getServer() {
    return this.app;
  }
}

export default App;