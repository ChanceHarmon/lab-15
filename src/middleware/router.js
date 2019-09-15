'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('../model/users-model');
const auth = require('./middleware');
const oauth = require('../oauth/aws-cognito');

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then((user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.post('/key', auth, (req, res, next) => {
  let key = req.user.generateAuthKey();
  res.send(key);
});

authRouter.get('/oauth', (req, res, next) => {
  oauth.authorize(req)
    .then(token => {
      res.status(200).send(token);
    })
    .catch(next);
});

module.exports = authRouter;