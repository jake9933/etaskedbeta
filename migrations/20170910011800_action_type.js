'use strict';
/* eslint-disable max-len */

exports.up = function(knex, Promise) {

    let onDefinedAction = (table) => {
        table.increments();
        table.string('type').unique().notNullable().defaultTo('');
        table.timestamps(true, true)
        table.boolean('active').defaultTo(1);
    };

    return knex.schema.createTableIfNotExists('action_types', onDefinedAction); 
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('action_types');
};
