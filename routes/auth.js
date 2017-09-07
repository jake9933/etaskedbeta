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
  let userID = req.session.id;
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

  let onRender = (data) => {
    if(data[0]==true){
      console.log(req.body.username + " account created.")
      res.redirect('/profile');
    }else{
      res.redirect('/');
    }
  };

  let userProimse = new Promise((resolve, reject) => {
    
    let query ={
      username:req.body.username
    };

    let saveUser = (user) => {
      console.log('saveUser')
      console.log(user)
      if(!user){

        createAvatar
          .generateAvatar(function(created_avatar) {

            let hash = bcrypt.hashSync(req.body.hashed_password, 12);
            
            let obj = {
              username: req.body.username,
              hashed_password: hash,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              email: req.body.username,
              admin: req.body.admin||false,
              avatar: created_avatar,
            };

            knex('users')
              .insert(obj)
              .then((data) => {
                console.log(req.body.username + " account created.")
                resolve([true,data]);
              })
              .catch((err) => {
                console.log("ERROR", err);
                reject([false,err]);
              });
        });
        
      } else{
        reject([false,'User unknow']);
      } 
    };
  
    knex('users')
        .where(query)
        .first()
        .then(saveUser)

  });

  userProimse
    .then(onRender)
    .catch((err) => {
      console.log('ERROR');
      res.redirect('/');
    });

});

router.post('/login', function(req, res, next) {

  let onRender = (data) => {
    if(data[0]==true){
      console.log(req.session.user.id + " logged in.");
      res.redirect('/profile');
    }else{
      res.redirect('/');
    }
  };

  let userPromise = new Promise((resolve, reject) => {

    let query = {
      username: req.body.username
    };

    let onLogin = (user) => {

      if(user){
        bcrypt.compare(req.body.hashed_password, user.hashed_password, function(err, data) {
          if (data) {
            bcrypt.hash(user.username, 10, function(err, hash) {
              
              let _session={
                session_id:hash,
                user_id:user.id,
                active:1
              };

              knex('sessions')
                .insert(_session)
                .then((data) => {
                  req.session.id = _session.session_id;
                  res.cookie("loggedin", true);
                  resolve([true,user]);
                })
                .catch((err) => {
                  console.log("ERROR", err);
                  reject([false,err]);
                });

            });
          }
          else {
            reject([false,'User or Password is wrong!']);
          }
        })
      }
      else{
        reject([false,'User or Password is wrong!']);
      }
    };

    knex('users')
      .where(query)
      .first()
      .then(onLogin)

  });

  userPromise
    .then(onRender)
    .catch((err) => {
      console.log('ERROR');
      res.redirect('/auth/login');
    });

});

router.get('/logout', function(req, res) {

  let query = {
    session_id:req.session.id
  };

  let update = {
    active:0
  };
  
  knex('sessions')
    .where(query)
    .first()
    .update(update)
    .then((data)=>{
      req.session = null;
      res.clearCookie('loggedin');
      res.redirect('/');
    });
});

module.exports = router
