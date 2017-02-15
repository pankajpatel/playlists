'use strict';

const Hapi = require('hapi');
const Inert = require('inert');

const config = require('../config');
const handlers = require('./lib');

// Create a server with a host and port

const server = new Hapi.Server();
server.connection(config.server);


const errorHandler = err => {
  if (err) {
    console.error(err);
  }
};


// Register/Add the plugins/modules
server.register([
  Inert,
  {
    register: require('yar'),
    options: {
      storeBlank: false,
      cookieOptions: {
        password: 'the-password-must-be-at-least-32-characters-long',
        isSecure: true
      }
    }
  }
], errorHandler);


// Add the routes

server.route([
  { // path:/all
    method: 'GET',
    path: '/all',
    handler: function (request, reply) {
      var table = server.table();
      let paths = [];
      let plugins = [];
      for (let prop in server.registrations) {
        let plugin = server.registrations[prop];
        plugins.push({
          name: plugin.name,
          version: plugin.version,
          dependencies: plugin.attributes.dependency ? plugin.attributes.dependency.length : 0
        });
      }

      table.forEach(function (server) {
        server.table.forEach(route => {
          paths.push({path: route.path, method: route.method.toUpperCase()});
        });
      });

      return reply({paths, plugins});
    }
  },
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true
      }
    }
  },
  { // path:/authenticate
    method: 'GET',
    path: '/authenticate',
    handler: handlers.authenticate
  },
  { // path:/callback
    method: 'GET',
    path: '/callback',
    handler: handlers.callback
  },
  { // path:/refresh
    method: 'GET',
    path: '/refresh',
    handler: handlers.refresh
  }
]);

// Start the server

server.start((err) => {
  if (err) {
    throw err;
  }
  server.connections.forEach(connection => {
      console.log('Server started at: ' + connection.info.uri);
  });
});
