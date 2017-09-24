// http://knexjs.org

'use strict';

module.exports = {

    development: {
        client: 'pg',
        connection: {
            database: 'etasked',
            host: 'localhost',
            user: "postgres",
            password: "root",
        }
    }
};
