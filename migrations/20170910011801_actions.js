'use strict';
/* eslint-disable max-len */

exports.up = function(knex, Promise) {

    let onDefinedAction = (table) => {
        table.increments();
        table.integer('post_id').unsigned().index().references('id').inTable('posts')
        table.integer('user_id').unsigned().index().references('id').inTable('users')
        table.integer('action_id').unsigned().index().references('id').inTable('action_types')
        table.timestamps(true, true)
        table.boolean('active').defaultTo(1);
    };

    return knex.schema.createTableIfNotExists('actions', onDefinedAction); 
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('actions');
};
