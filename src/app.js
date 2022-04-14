import express from 'express';

class App {
  app;

  constructor(controller) {
    this.app = express();
  }

  getServer() {
    return this.app;
  }
}

export default App;