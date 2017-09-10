'use strict'

const express = require('express');
const router = express.Router();

//This is where you get the params.
// const router = express.Router({
//   mergeParams: true
// })
const knex = require('../knex');
const bcrypt = require('bcrypt');
const flash = require('flash');

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

let userPromise = (session) => { 
  
    return new Promise((resolve, reject) => {
        var query = {
            'users.id':session.user_id
        };
        knex('users')
            .select('users.*')
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

function authorizedUser(req, res, next) {

  let userID = req.session.id;
  if (userID) {
    next();
  }
  else {
    res.render('/')
    //restricted if dev.
  }

}

function authorizedAdmin(req, res, next) {

  let userID = req.session.user;
  knex('users').where('id', userID.id).first().then(function(admin) {
    if (admin.admin) {
      next();
    }
    else {
      res.render('admin')
    }
  })
}

router.get('/', authorizedUser, function(req, res, next) {

  let onFetchPosts=(user)=>{
    return new Promise((resolve, reject)=>{
      knex('users')
        .innerJoin('posts', 'users.id', 'posts.user_id')
        .where('users.id', user.id)
        .then(function(posts) {
          resolve(posts)
        })
        .catch((err)=>{
          reject(err);
        });
    });
  };

  let onRender=(data)=>{
    console.log(data);
    res.render('posts', {
      posts: data
    });
  };
  
  getSession
  .then(userPromise)
  .then(onFetchPosts)
  .then(onRender)
  .catch((err)=>{
    console.log('getPosts')
    console.log(err)
  });

});

router.get('/new', authorizedUser, function(req, res, next) {
  res.render('new')
})

router.post('/', authorizedUser, function(req, res, next) {

  let onCreatePost = (user) =>{
    return new Promise((resolve, reject)=>{
      let post ={
        title: req.body.title,
        body: req.body.body,
        user_id: user.id
      };

      knex('posts')
        .insert(post)
        .then((data)=>{
          resolve(data);
        })
        .catch((err)=>{
          console.log('err')
          console.log(err)
          resolve(err);
        });
    });
  };

  let onResponse = (data) => {
    return res.json(data);    
  };

  getSession(req.session.id)
    .then(userPromise)
    .then(onCreatePost)
    .then(onResponse);

});


router.get('/:id', function(req, res, next) {
  let postID = req.params.id;
  knex('posts').where('id', postID).first().then(function(post) {
      // console.log(post);
      return post;
    })
    .then(function(post) {
      knex('users').innerJoin('comments', 'users.id', 'comments.user_id').where('comments.post_id', postID).then(function(data) {
        console.log("post: " + post.body);
        // console.log("data: " + data);
        res.render('single', {
          postID: postID,
          post: post,
          data: data
        })
      })
    })

  router.get('/:id/edit', authorizedUser, function(req, res, next) {
    let postID = req.params.id;
    knex('posts').where('id', postID).first().then(function(post) {
      res.render('edit', {
        post: post
      })
    })
  })

  router.get('/:id/comment/edit', authorizedUser, function(req, res, next) {
    let postID = req.params.id;
    knex('comments').where('post_id', postID).first().then(function(comment) {
      res.render('editcomment', {
        comment: comment
      })
    })

  })

  // knex('users').select(['users.username', 'posts.title', 'posts.body', 'comments.content'])
  //             .where('posts.id', postID)
  //             .innerJoin('posts', 'users.id', 'posts.user_id')
  //             .innerJoin('comments', 'users.id', 'comments.user_id')
  //             .then(function (post) {
  //                 console.log(post);
  //                 res.render('single', {
  //                   post:post,
  //                   postID: postID
  //                 })
  //               })
})

router.post('/:id', authorizedUser, function(req, res, next) {
  let postID = req.params.id;
  knex('comments').insert({
    content: req.body.content,
    post_id: knex.select('id').from('posts').where('id', postID),
    user_id: knex.select('id').from('users').where('id', req.session.user.id)
  }).then(function() {
    res.redirect('/posts/' + postID);
  })
})

router.delete('/:id', authorizedAdmin, function(req, res, next) {
  let postID = req.params.id;
  knex('posts').where('id', postID).del().then(function(deleted) {
    res.redirect('/posts')
  })
})

router.put('/:id', authorizedAdmin, function(req, res, next) {
  let postID = req.params.id;
  knex('posts').where('id', postID).update({
    title: req.body.title,
    body: req.body.body
  }).then(function(post) {
    res.redirect('/posts/' + postID)
  })
})

// router.put(':id/comments', authorizedAdmin, function (req, res, next) {
//   let postID = req.params.id;
//   knex('comments').where('post_id', postID).update({
//     content: req.body.content
//   }).then(function (comment){
//     res.redirect('/posts/' + postID)
//   })
// })
module.exports = router;
