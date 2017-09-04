'use strict'

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const flash = require('flash');

function authorizedUser(req, res, next) {
  //
  let userID = req.session.user;
  if(userID){
    next();
  } else {
    res.sendFile('index.html');
  }
// restricted if dev
}

function authorizedAdmin(req, res, next) {
  //
  let userID = req.session.user;
  knex('users').where('id', userID.id).first().then(function (admin) {
    if(admin.admin){
      next();
    } else {
      res.render('admin')
    }
  })
}

router.get('/', [authorizedUser, authorizedAdmin], function(req, res, next) {
  res.render('users/all')
})


//This should show users info, posts, and comments
router.get('/:id', [authorizedUser, authorizedAdmin], function (req, res) {
  let userID = req.params.id;
  knex('users').where('id', userID).first().then(function (user){
    knex('posts').where('user_id', userID).then(function (posts){
      knex('comments').where('user_id', userID).then(function (comments){
        res.render('users/single', {
          user: user,
          posts: posts,
          comments: comments,
        })
      })
    })
  })
})

module.exports = router
