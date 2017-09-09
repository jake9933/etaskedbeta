'use strict';
/* eslint-disable max-len */

exports.up = function(knex, Promise) {

    let onDefinedRoles = (table) => {
        table.increments();
        table.string('role')
        table.timestamps(true, true)
        table.boolean('active').defaultTo(1);
    };

    return knex.schema.createTableIfNotExists('roles', onDefinedRoles); 
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('roles');
};
