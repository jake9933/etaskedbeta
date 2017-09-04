'use strict';
/* eslint-disable max-len */

exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('users', function(table) {
    table.increments();
    table.boolean('admin').defaultTo(false);
    table.string('username').unique();
    table.string('first_name');
    table.string('last_name');
    table.string('email').unique();
    table.string('hashed_password');
    table.string('avatar');
    table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
