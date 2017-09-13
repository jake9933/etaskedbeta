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
};

router.get('/', authorizedUser, function(req, res, next) {

  let onFetchPosts=(user)=>{
    return new Promise((resolve, reject)=>{
      knex('users')
        .innerJoin('posts', 'users.id', 'posts.user_id')
        .where('users.id', user.id)
        .then(function(posts) {
          resolve({posts:posts, user:user})
        })
        .catch((err)=>{
          reject({error:err, user:user});
        });
    });
  };

  let onFetchCommnets=(data)=>{
    return Promise((resolve, reject)=>{
      knex('posts')
        .innerJoin('comments', 'posts.id', 'comments.post_id')
        .where('posts.id', data.posts.id)
        .then((comments)=>{
          resolve({posts:data.posts, user:data.user, comments:comments});
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
          resolve({posts:posts, user:user, comments:comments, actions:actions});
        })
        .catch((err)=>{
          reject({error:err});
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
    //.then(onFetchCommnets)
    //.then(onFatchActions)
    .then(onRender)
    .catch((err)=>{
      console.log('getPosts')
      console.log(err)
    });

});

router.get('/new', authorizedUser, function(req, res, next) {
  res.render('new')
});

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
});

/*
  router.post('/:id', authorizedUser, function(req, res, next) {
  let postID = req.params.id;
  knex('comments').insert({
    content: req.body.content,
    post_id: knex.select('id').from('posts').where('id', postID),
    user_id: knex.select('id').from('users').where('id', req.session.user.id)
  }).then(function() {
    res.redirect('/posts/' + postID);
  })
});
*/

router.delete('/:id', authorizedAdmin, function(req, res, next) {
  let postID = req.params.id;
  knex('posts').where('id', postID).del().then(function(deleted) {
    res.redirect('/posts')
  })
});

router.put('/:id', authorizedAdmin, function(req, res, next) {
  let postID = req.params.id;
  knex('posts').where('id', postID).update({
    title: req.body.title,
    body: req.body.body
  }).then(function(post) {
    res.redirect('/posts/' + postID)
  })
});

router.post('/like', authorizedUser, function(req, res, next){
 
  let onCreateLike = (user) => {
    return new Promise((resolve, reject)=>{

      let postId = req.body.post_id;
      let action_type = req.body.action_type;

      let objToSend = {
        post_id : postId,
        user_id : user.id,
        action_id : action_type || 1
      };

      knex('actions')
        .whereNot(objToSend)
        .first()
        .then(function(data){
          if(data){
            resolve(data);
            return;
          }
          knex('actions')
            .insert(objToSend)
            .then((data)=>{
              resolve(data);
            })
            .catch((err)=>{
              reject(err);
            });
        });
      
    });
  };

  let onResponse = (data) => {
    console.log('data');
    console.log(data);
    return res.json(data);
  };

  getSession(req.session.id)
    .then(userPromise)
    .then(onCreateLike)
    .then(onResponse);

});

router.put('/like/:id', function(req, res, next){

  let postId=req.params.id; 

  let unLike = (user) => {
    return new Promise((resolve, reject)=>{      
      let query = {
        post_id : postId,
        user_id : user.id,
        active : 1
      };

      let update ={
        active:0
      };

      knex('actions')
        .where(query)
        .update(update)
        .then((data)=>{
          resolve(data);
        })
        .catch((err)=>{
          reject(err);
        });
    });
  };

  let onResponse=(data)=>{
    return res.json(data);
  };
  
  getSession(req.session.id)
  .then(userPromise)
  .then(unLike)
  .then(onResponse);

}); 

router.post('/comments', function (req, res, next) {
   let postId = req.body.post_id;
   let comment = req.body.comment;

   let onCreatePostCommnent=(user)=>{
    return new Promise((resolve, reject)=>{
      
      let obj={
        content:comment,
        user_id:user.id,
        post_id:postId
      };
            
      knex('comments')
        .insert(obj)
        .then((commentinsert)=>{
          knex('comments')
          .where(obj)
          .first()
          .then(function(comment){
            resolve(user);
          });
        })
        .catch((err)=>{
          reject(err);
        });
    }); 
   };

   let onResponse=(data)=>{
     return res.json(data);
   };

   getSession(req.session.id)
   .then(userPromise)
   .then(onCreatePostCommnent)
   .then(onResponse)
   .catch(onResponse)

});

router.put('/:id/comments/:id_comment', authorizedUser, function(req, res, next){
  let postId = req.params.id;
  let commentId = req.params.comment;

  let onUpdateComments=()=>{
    return new Promise((resolve, reject)=>{
      let query = {
        id:commentId,
        post_id:postId
      };

      let update = {
        content:req.body.content
      };

      let onResponse=(data)=>{
        resolve(data);
      };

      let onFail=(err)=>{
        reject(err);
      };

      knex('comments')
      .where(query)
      .update(update)
      .then(onResponse)
      .catch(onFail);

    });
  };

  let onResponse=(data)=>{
    return res.json(data);
  };

  getSession(req.session.id)
    .then(onUpdateComments)
    .then(onResponse);
});

module.exports = router;
