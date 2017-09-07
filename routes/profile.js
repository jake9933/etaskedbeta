'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const flash = require('flash');

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
        res.render('profile/profile',{
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
                resolve(data);
            })
            .catch((err)=>{
                reject(err);
            });
    });

    let userPromise = (session) => { 
        
        return new Promise((resolve, reject) => {
            var query = {
                id:session.user_id
            };
            knex('users')
                .where(query)
                .then((user)=>{
                    if(user){
                        resolve(user[0]);
                    }
                    resolve({});
                })
                .catch((err)=>{
                    reject(err);
                });
        });
    };

    getSession
        .then(userPromise)
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