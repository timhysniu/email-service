var Path = require('path');

var options = {
  projectName: "Nylas",
  rootPath: Path.normalize(__dirname + '/../'),
  server: {
    hostname: 'localhost',
    port: 3001
  },
  db: {
    mongoUrl: 'mongodb://localhost/nylas'
  },
};

module.exports = options;