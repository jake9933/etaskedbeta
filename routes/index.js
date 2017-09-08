'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const flash = require('flash');


router.get('/', function(req, res, next) {
    console.log('inicio ---------------')
    res.render('index')
})

module.exports = router