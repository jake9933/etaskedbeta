'use strict';
/* eslint-disable max-len */

exports.up = function(knex, Promise) {
    return knex.schema.createTable('profile', (table) => {
        table.increments();
        table.text('first_name').notNullable();
        table.text('last_name').notNullable();
        table.text('email').notNullable();
        table.text('website').notNullable();
        table.text('phone').notNullable();
        table.text('country').notNullable();
        table.text('state').notNullable();
        table.text('city').notNullable();
        table.text('occupation').notNullable();
        table.text('gender').notNullable();
        table.text('facebook').notNullable();
        table.text('twitter').notNullable();
        table.text('linkedin').notNullable();
        table.timestamps(true, true);
        table.integer('user_id').unsigned().index().references('id').inTable('users').onDelete('CASCADE');
        table.boolean('active').defaultTo(1);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('profile');
};
