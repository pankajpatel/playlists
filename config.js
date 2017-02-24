const path = require('path');
const outputDir = 'public';
require('dotenv').load();
const config = require('./config.ui');

module.exports = Object.assign({
  server: {
    host: '127.0.0.1',
    port: 8080,
    routes: {
      files: {
        relativeTo: path.join(__dirname, outputDir)
      }
    }
  },
  client: {
    host: '127.0.0.1',
    port: 8888,
    routes: {
      files: {
        relativeTo: path.join(__dirname, outputDir)
      }
    }
  },
  db: {
    url: process.env.MONGODB
  }
}, config);
