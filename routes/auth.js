'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const flash = require('flash');
const createAvatar = require('../public/js/octodex_avatar');

// const Users = function() { return knex('users') };
function authorizedUser(req, res, next) {
  //
  let userID = req.session.user.id;
  if (userID) {
    next();
  }
  else {
    res.sendFile('index.html');
  }
}

function authorizedAdmin(req, res, next) {
  //
}

router.get('/', function(req, res, next) {
  let user = req.session.user;
  res.render('users/auth', {
    user: user
  })
})

router.get('/signup', function(req, res, next) {
  res.render('users/signup')
})

router.get('/login', function(req, res, next) {
  res.render('users/login');
})

router.post('/signup', function(req, res, next) {
  knex('users').where({
    username: req.body.username
  }).first().then(function(user) {
    if (!user) {
      let hash = bcrypt.hashSync(req.body.hashed_password, 12);
      createAvatar.generateAvatar(function(created_avatar) {
        knex('users').insert({
          username: req.body.username,
          hashed_password: hash,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          admin: req.body.admin,
          avatar: created_avatar,
        }).then(function() {
          res.redirect('/profile');
          console.log(req.body.username + " account created.")
        })
      });
    }
    else {
      res.redirect('/profile');
    }
  })
})

router.post('/login', function(req, res, next) {
  knex('users').where({
    username: req.body.username
  }).first().then(function(user) {
    if (!user) {
      res.send('no username')
    }
    else {
      bcrypt.compare(req.body.hashed_password, user.hashed_password, function(err, result) {
        if (result) {
          req.session.user = user;
          res.cookie("loggedin", true);
          console.log(req.session.user.id + " logged in.");
          res.redirect('/profile');
        }
        else {
          res.sendFile(__dirname + '../public/index.html');
        }
      })
    }
  })
})

router.get('/logout', function(req, res) {
  req.session = null;
  res.clearCookie('loggedin');
  console.log("User logged out.");
})

console.log("Authentication successfully connected.")
module.exports = router
