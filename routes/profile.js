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
            let query = {
                'users.id':user.id//,
                //'actions.action_id': 1
            };
            knex('users')
                .innerJoin('posts', 'users.id', 'posts.user_id')
                .where(query)
                .then(function(posts) {

                    let getLikes = function(index, post, callback){
                        knex('actions')
                        .where({'actions.post_id':post.id, 'actions.user_id':user.id})
                        .count()
                        .then((data)=>{
                            callback(index, data[0].count);
                        });
                    };

                    for(var i=0;i<posts.length;i++){
                        getLikes(i, posts[i], function(index, likes){
                            posts[index]['likes']=parseInt(likes);
                        });                       
                    }
                    resolve({user:user, posts:posts})
                })
                .catch((err)=>{
                    reject({error:err,user:{}});
                });
        });
    };

    let onFetchCommnets=(data)=>{
        return new Promise((resolve, reject)=>{
            let posts = data.posts.slice();
            let users = data.user;

            function getComment(index, post, callback){
                knex('posts')
                    .innerJoin('comments', 'posts.id', 'comments.post_id')
                    .innerJoin('users', 'comments.user_id', 'users.id')
                    .where('posts.id', post.id)
                    .then((comments)=>{
                        callback(index, comments);
                    })
                    .catch((err)=>{
                        reject({error:err});
                    });
            };
            
            function iteratePost(data, callback){
                for(var i=0; i<data.length; i++){
                    getComment(i, data[i], function(index, comments){
                        posts[index]['comments']=comments.slice();
                    });
                };
                callback(posts);
            };

            iteratePost(data.posts, function(data){
                resolve({ user:users, posts:data});
            });

        });
    };
    
    let onFatchActions=(data)=>{
        return Promise((resolve, reject)=>{
            knex('posts')
                .innerJoin('actions', 'posts.id', 'actions.post_id')
                .where('posts.id', data.posts.id)
                .then((actions)=>{
                    resolve({posts:data.posts, user:data.user, actions:actions});
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
            var obj={
                user:data.user,
                posts:data.posts,
                comments:data.comments,
                actions:data.actions
            };
            res.render('profile/'+role.role+'/profile', obj);
        });    
    };

    getSession(req.session.id)
        .then(userPromise)
        .then(onFetchPosts)
        .then(onFetchCommnets)
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