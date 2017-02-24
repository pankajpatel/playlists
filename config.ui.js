const path = require('path');
const outputDir = 'public';

module.exports = {
  ui: {
    title: 'Playlists',
    srcDir: 'src',
    entry: 'js/index.js',
    outputDir: outputDir,
    outputFile: 'js/app.bundle.js', //relative to outputDir
    preprocessor: 'scss' //or 'less'
  }
}
