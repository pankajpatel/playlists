require('dotenv').load();
const querystring = require('querystring');
const Wreck = require('wreck');
const Bell = require('../../bell');
console.log(Bell)
const SpotifyWebApi = require('spotify-web-api-node');

const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});


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

  var code = request.query.code || null;
  var state = request.query.state || null;
  var storedState = request.yar.get(stateKey) || null;
  console.log(code)
  spotifyApi.setAccessToken(code);
  // Get the authenticated user
  spotifyApi.getMe()
    .then(function(data) {
      reply(data.body);
      console.log('Some information about the authenticated user', data.body);
    }, function(err) {
      console.log('Something went wrong!', err);
    });
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
