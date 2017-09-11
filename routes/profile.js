'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const flash = require('flash');
const hbs = require('hbs');

function authorizedUser(req, res, next) {
    let _sessionId = req.session.id;
    if(_sessionId){
      next();
    } else {
      res.sendFile('index.html');
    }
};

let getSession = (session)=>{
    return new Promise((resolve, reject) => {
      var query = {
          session_id:session,
          active:1
      };
  
      knex('sessions')
          .where(query)
          .first()
          .then((data)=>{
            resolve(data);           
          })
          .catch((err)=>{
              reject(err);
          });
    });
};
  
let userPromise = (session)=>{
    return new Promise((resolve, reject) => {
        var query = {
              'users.id':session.user_id
        };
        knex('users')
            .select('users.*')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .where(query)
            .first()
            .then((user)=>{
                if(user){
                    resolve(user);
                }
                resolve({});
            })
            .catch((err)=>{
                reject(err);
            });
      });
};

router.get('/', authorizedUser, function(req, res, next) {
   
    let onFetchPosts=(user)=>{
        return new Promise((resolve, reject)=>{
            knex('users')
                .innerJoin('posts', 'users.id', 'posts.user_id')
                .where('users.id', user.id)
                .then(function(posts) {
                    resolve({user:user, posts:posts})
                })
                .catch((err)=>{
                    reject({error:err,user:{}});
                });
        });
    };

    let onFetchCommnets=(data)=>{
        return Promise((resolve, reject)=>{
            knex('posts')
                .innerJoin('comments', 'posts.id', 'comments.post_id')
                .where('posts.id', data.posts.id)
                .then((comments)=>{
                    resolve({ user:data.user, posts:data.posts, comments:comments});
                })
                .catch((err)=>{
                    reject({error:err});
                });
        });
    };
    
    let onFatchActions=(data)=>{
        return Promise((resolve, reject)=>{
            knex('posts')
                .innerJoin('actions', 'posts.id', 'actions.post_id')
                .where('posts.id', data.posts.id)
                .then((actions)=>{
                    resolve({posts:data.posts, user:data.user, comments:data.comments, actions:actions});
                })
                .catch((err)=>{
                    reject({error:err});
                });
        });
    };

    let onRender = (data) => {
        knex()
        .select('role')
        .from('roles')
        .where('id',data.user.role_id)
        .first()
        .then((role)=>{
            res.render('profile/'+role.role+'/profile',{
                user:data.user,
                posts:data.posts,
                comments:data.comments,
                actions:data.actions
            });
        });    
    };

    getSession(req.session.id)
        .then(userPromise)
        .then(onFetchPosts)
        .then(onRender)
        .catch((err)=>{
            console.log('ERROR:')
            console.log(err)
            res.redirect('/');
            return;
        });
});

router.get('/edit', function(req, res, next) {
     res.render('profile/editprofile')
});

module.exports = router