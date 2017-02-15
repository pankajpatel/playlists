require('dotenv').load();
const Wreck = require('wreck');
const querystring = require('querystring');

const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';

const authenticate = function(request, reply) {

  var state = generateRandomString(16);

  request.yar.set(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  reply.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
};

const callback = function(request, reply) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = request.query.code || null;
  var state = request.query.state || null;
  var storedState = request.yar.get(stateKey) || null;

  if (state === null || state !== storedState) {
    reply.redirect('/#/error?' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    request.yar.clear(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    Wreck.post(authOptions.url, authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        Wreck.get(options.url, options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        reply.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        reply.redirect('/#/error?' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
}

const refresh = function(request, reply) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  Wreck.post(authOptions.url, authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      reply({
        'access_token': access_token
      });
    }
  });
}

module.exports = {
  authenticate, callback, refresh
}
