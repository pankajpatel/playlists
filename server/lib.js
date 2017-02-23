require('dotenv').load();
const Bell = require('../../bell');
const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config');

let Plugin = {};
Plugin.register = function(server, options, next) {

  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
  });
  server.register([{
        register: require('yar'),
        options: {
          storeBlank: false,
          cookieOptions: {
            password: process.env.COOKIE_PASSWORD,
            isSecure: true
          }
        }
      }, {
        register: require('hapi-mongodb'),
        options: config.db
      },
      require('hapi-auth-cookie'),
      Bell
    ], function (err) {

      //Setup the session strategy
      server.auth.strategy('session', 'cookie', {
          password: 'secret_cookie_encryption_password', //Use something more secure in production
          redirectTo: '/auth/spotify', //If there is no session, redirect here
          isSecure: false //Should be set to true (which is the default) in production
      });

      server.auth.strategy('spotify', 'bell', {
          provider: 'spotify',
          password: process.env.COOKIE_PASSWORD,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
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

              db.collection('config').updateOne({"provider": "spotify"}, authCredentials, {upsert: true}, (err, result) => {
                if(err) return reply(Boom.internal('Internal MongoDB error', err));
              });
              request.yar.set('spotify', { token: request.auth.credentials.token });
              return reply.redirect('/');
            }
          }
        },
        {
          method: 'GET',
          path: '/api/user',
          config: {
            handler: function(request, reply) {
              var token = null;
              if( request.yar.get('spotify') === undefined || request.yar.get('spotify') === null){
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('config').findOne({'provider':'spotify'}, function (err, result) {
                  if(err){
                    return reply(Boom.internal('Internal MongoDB error', err));
                  }
                  if(result && typeof result.token != 'undefined' ) {
                    token = result.token;
                    spotifyApi.setAccessToken(token);
                    spotifyApi.getMe()
                      .then(function(data) {
                        console.log('Some information about the authenticated user', data.body);
                        return reply(data.body);
                      }, function(err) {
                        console.log('Something went wrong!', err);
                        return reply(Boom.internal('Internal MongoDB error', err));
                      });
                  } else {
                    return reply.redirect('/auth/spotify');
                  }
                })
              } else {
                token = request.yar.get('spotify').token;
                return get(token, reply);
              }
            }
          }
        }
      ]);
      next();
    }
  );
}

Plugin.register.attributes = {
  pkg: require('../package')
};

module.exports = Plugin;
