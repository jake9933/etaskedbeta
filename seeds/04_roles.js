'use strict';

// /* eslint-disable camelcase */
// /* eslint-disable max-len */

 exports.seed = function(knex) {
     // Deletes ALL existing entries
    return knex('roles')
        .del()
        .then(function() {
            const roles = [{
                role: 'mentor'
            }, {
                role: 'mentee'
            }];
            return knex('roles').insert(roles);
        });
 };