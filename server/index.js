'use strict';

const Hapi = require('hapi');
const Inert = require('inert');

require('dotenv').load();

const config = require('../config');
const AppPlugin = require('./lib');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection(config.server);

server.state('data', {
  ttl: null,
  isSecure: true,
  isHttpOnly: true,
  encoding: 'base64json',
  clearInvalid: false, // remove invalid cookies
  strictHeader: true // don't allow violations of RFC 6265
});

const errorHandler = err => {
  if (err) {
    console.error(err);
    throw err;
  }
};

// Register/Add the plugins/modules
server.register([
  Inert,
  AppPlugin
], function(err) {
  errorHandler(err);
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

});
