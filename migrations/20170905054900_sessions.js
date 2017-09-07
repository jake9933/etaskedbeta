'use strict';
/* eslint-disable max-len */

exports.up = function(knex, Promise) {

    let onDefinedSession = (table) => {
        table.increments();
        table.string('session_id')
        table.integer('user_id').unsigned().index().references('id').inTable('users')
        table.timestamps(true, true)
        table.boolean('active').defaultTo(1);
    };

    return knex.schema.createTableIfNotExists('sessions', onDefinedSession); 
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('sessions');
};
