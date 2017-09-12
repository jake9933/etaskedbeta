'use strict';
/* eslint-disable max-len */

exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('comments', function(table) {
    table.increments();
    table.string('content');
    table.integer('user_id').unsigned().index().references('id').inTable('users');
    table.integer('post_id').unsigned().index().references('id').inTable('posts');
    table.timestamps(true, true);
    table.boolean('active').defaultTo(1);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('comments');
};
