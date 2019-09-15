'use strict';

const User = require('../model/users-model');

module.exports = (req, res, next) => {

  try {
    let [authType, authString] = req.headers.authorization.split(/\s+/);

    switch (authType.toLowerCase()) {
      case 'basic':
        return _authBasic(authString);
      case 'bearer':
        return _authBearer(authString);
      default:
        return _authError();
    }
  }
  catch (e) {
    next(e);
  }

  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString, 'base64');
    let bufferString = base64Buffer.toString();
    let [username, password] = bufferString.split(':');
    let auth = { username, password };

    return User.authenticateBasic(auth)
      .then(user => _authenticate(user))
      .catch(next);
  }

  function _authBearer(authString) {
    return User.authenticateToken(authString)
      .then(user => _authenticate(user))
      .catch(next);
  }

  function _authenticate(user) {
    if (user) {
      req.user = user;
      if (process.env.REMEMBER === 'yes') {
        req.token = user.generateTimedToken();
      } else {
        req.token = user.generateToken();
      }
      next();
    }
    else {
      _authError();
    }
  }

  function _authError() {
    next('Invalid User ID/Password');
  }

};