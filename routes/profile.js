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
  }

router.get('/', authorizedUser, function(req, res, next) {

    let onRender = (data) => {

        res.render('profile/'+data.role+'/profile',{
            user:data
        });
    };

    let getSession = new Promise((resolve, reject) => {
        var query = {
            session_id:req.session.id,
            active:1
        };

        knex('sessions')
            .where(query)
            .first()
            .then((data)=>{
                userPromise(data)
                .then((user)=>{
                    resolve(user);
                })
            })
            .catch((err)=>{
                reject(err);
            });
    });

    let userPromise = (session) => { 

        return new Promise((resolve, reject) => {
            var query = {
                'users.id':session.user_id
            };
            knex('users')
                .where(query)
                .innerJoin('roles', 'users.role_id', 'roles.id')
                .first()
                .then((user)=>{
                    console.log(user)
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

    getSession
        .then(onRender)
        .catch((err)=>{
            console.log('ERROR:')
            console.log(err)
            res.redirect('/');
            return;
        });
})

router.get('/edit', function(req, res, next) {
     res.render('profile/editprofile')
})

module.exports = router