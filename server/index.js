'use strict';

const Hapi = require('hapi');
const Wreck = require('wreck');
const Inert = require('inert');

require('dotenv').load();
const Bell = require('../../bell');

const config = require('../config');
// const handlers = require('./lib');

// console.log(Bell.providers.spotify)

const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri
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
  }
};

//Custom error tapping to puke out nasty errors on console
const handler = function (request, reply) {
    const response = request.response;
    if (!response.isBoom) {
      return reply.continue();
    }
    console.log(request.response, request.response.statusCode);
    const error = response;
    error.output.payload.custom = 'Key';
    return reply(error);
};

server.ext('onPreResponse', handler);

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
  },
  {
    register: require('hapi-mongodb'),
    options: config.db
  }
], errorHandler);

// Register bell with the server
server.register([require('hapi-auth-cookie'), Bell], function (err) {

    //Setup the session strategy
    server.auth.strategy('session', 'cookie', {
        password: 'secret_cookie_encryption_password', //Use something more secure in production
        redirectTo: '/auth/spotify', //If there is no session, redirect here
        isSecure: false //Should be set to true (which is the default) in production
    });

    server.auth.strategy('spotify', 'bell', {
        provider: 'spotify',
        password: 'secret_cookie_encryption_password',
        clientId: client_id,
        clientSecret: client_secret,
        isSecure: false
    });
    server.route([
      {
        method: ['GET', 'POST'],
        path: '/auth/spotify',
        config: {
          auth: 'spotify',
          handler: function (request, reply) {
            // console.log(request.auth);
            if (!request.auth.isAuthenticated) {
              return reply('Authentication failed due to: ' + request.auth.error.message);
            }

            var db = request.server.plugins['hapi-mongodb'].db;

            var authCredentials = request.auth.credentials;

            db.collection('config').updateOne({"spotify-token": request.auth.credentials.token}, authCredentials, {upsert: true}, (err, result) => {
              if(err) return reply(Boom.internal('Internal MongoDB error', err));
            });
            request.yar.set('spotify', { token: request.auth.credentials.token });
            console.log(request.yar)
            return reply.redirect('/home');
          }
        }
      },
      {
        method: 'GET',
        path: '/home',
        config: {
          handler: function(request, reply) {
            var token = null;
            if( request.yar.get('spotify') === undefined || request.yar.get('spotify') === null){
              console.log('Get Token from DB:'+token+'\n\n\n');

              var db = request.server.plugins['hapi-mongodb'].db;
              db.collection('config').findOne({'provider':'spotify'}, function (err, result) {
                if(err) return reply(Boom.internal('Internal MongoDB error', err));

                if(result && typeof result.token != 'undefined' ) {
                  token = result.token;
                } else {
                  return reply.redirect('/auth/spotify');
                }
              })
            } else {
             token = request.yar.get('spotify').token;
            }
            console.log('Token:'+token+'\n\n\n');
            Wreck.get('https://api.spotify.com/v1/me', { headers: { 'Authorization': 'BEARER ' + token } }, function (err, response, payload) {
              console.log(payload);
              return reply(payload);
            });
          }
        }
      }
    ]);
});

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
