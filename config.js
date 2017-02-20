const path = require('path');
const outputDir = 'public';
require('dotenv').load();

module.exports = {
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
  },
  ui: {
    title: 'Playlists',
    srcDir: 'src',
    entry: 'js/index.js',
    outputDir: outputDir,
    outputFile: 'js/app.bundle.js', //relative to outputDir
    preprocessor: 'scss' //or 'less'
  }
}
