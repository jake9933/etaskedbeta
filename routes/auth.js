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
};

let onCreateSession = (user, callback)=>{
  bcrypt.hash(user.username, 10, function(err, hash) {
    
    let _session={
      session_id:hash,
      user_id:user.id,
      active:1
    };

    knex('sessions')
      .insert(_session)
      .then((data) => {
        callback(true,user, _session);
      })
      .catch((err) => {
        console.log("ERROR sessions", err);
        callback(false,err,{});
      });

  });
};

let getUser = (req) =>{
    return new Promise((resolve, reject)=>{
    let query ={
      'users.username':req.body.username
    };
    knex('users')
      .where(query)
      .innerJoin('roles', 'users.role_id', 'roles.id')
      .first()
      .then((data)=>{resolve(data);})
      .then((err)=>{reject(err);})
  });
};

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
      res.redirect('/profile');
    }else{
      res.redirect('/');
    }
  };

  let rolePromise = new Promise((resolve, reject)=>{
    let query = {
      role:req.body.role.toLowerCase()
    };
    knex('roles')
      .where(query)
      .first()
      .then((data)=>{
        resolve(data);
      })
      .catch((err)=>{
        console.log(err)
        console.log('error')
        reject(err);
      });
  });

  let userProimse = new Promise((resolve, reject) => {
    
    let query ={
      username:req.body.username
    };
  
    let saveUser = (user) => {
     
      if(!user){

        createAvatar
          .generateAvatar((created_avatar)=>{

            rolePromise
              .then((data)=>{

                let hash = bcrypt.hashSync(req.body.hashed_password, 12);
                
                let obj = {
                  username : req.body.username,
                  hashed_password : hash,
                  first_name : req.body.first_name,
                  last_name : req.body.last_name,
                  email : req.body.username,
                  admin : req.body.admin||false,
                  avatar : created_avatar,
                  role_id : data.id
                };
     
                knex('users')
                  .insert(obj)
                  .then((d) => {
                    getUser(req).then((u)=>{
                      onCreateSession(u,(err, data, _session)=>{
                        req.session.id = _session.session_id;
                        res.cookie("loggedin", true);
                        resolve([err, data])
                      })
                    });
                  })
                  .catch((err) => {
                    console.log("ERROR creating user", err);
                    reject([false,err]);
                  });
              });
        });
        
      } else{
        resolve([false,'User unknow']);
      } 
    };
  
    getUser(req).then(saveUser).catch((err)=>{reject(err);});

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
      console.log(req.session.id + " logged in.");
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
      console.log(user)
      console.log('user')
      if(user){
        bcrypt.compare(req.body.hashed_password, user.hashed_password, function(err, _data) {
          if (_data) {
            console.log(user)
            onCreateSession(user,(err, data, _session)=>{
              req.session.id = _session.session_id;
              res.cookie("loggedin", true);
              resolve([err, data])
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

    getUser(req).then(onLogin);

  });

  userPromise
    .then(onRender)
    .catch((err) => {
      console.log('ERROR ', err);
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
