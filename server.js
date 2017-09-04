'use strict'

// Express app.
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const ip = process.env.IP || '127.0.0.1';

// Knex Database.
const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile.js')[environment];
const knex = require('./knex')(config);

// Middleware plugins.
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const hbs = require('hbs');


// Application Routes.
const users = require('./routes/users');
const auth = require('./routes/auth');
const profile = require('./routes/profile');
const posts = require('./routes/posts');
const mentors = require('./routes/mentors');


// Helpers for Handlebars.js limit reduces views.
hbs.registerHelper('select', function(selected, options) {
    return options.fn(this)
        .replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"');
});

// Limit first {x} helper.
hbs.registerHelper('limitSort', function(arr, limit, key) {
    return arr.sort(function(a, b) {
        var x = a[key],
            y = b[key];

        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    }).slice(0, limit);
});

// Reverse arguments.
hbs.registerHelper('reverse', function(arr) {
    arr.reverse();
});


// Unix timestamp in seconds.
hbs.registerHelper("prettyDate", function(timestamp) {
    timestamp = timestamp.getTime() / 1000;
    var date,
        monthNames,
        secs = ((new Date()).getTime() / 1000) - timestamp,
        minutes = secs / 60,
        hours = minutes / 60,
        days = hours / 24,
        weeks = days / 7,
        months = weeks / 4.34812,
        years = months / 12;

    if (secs < 10) {
        secs = Math.floor(secs % 60);
        return "few moments ago";
    }

    if (minutes < 1) {
        secs = Math.floor(secs % 60);
        return secs + (secs > 1 ? " seconds ago" : " second ago");
    }
    if (hours < 1) {
        hours = Math.floor(minutes % 60);
        return hours + (minutes > 1 ? " minutes ago" : " minute ago");
    }
    if (days < 1) {
        hours = Math.floor(hours % 24);
        return hours + (hours > 1 ? " hours ago" : " hour ago");
    }
    else if (days < 4) {
        days = Math.floor(days % 7);
        return days + (days > 1 ? " days ago" : " day ago");
    }
    else {
        date = new Date(timestamp * 1000);
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthNames[date.getMonth()] + " " + date.getDate();
    }
});


// Used Middlewares.
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieSession({
    secret: "etasked",
}))
app.use(require('flash')());

// Used Routes.
app.use('/users', users);
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/posts', posts);
app.use('/mentors', mentors);

// Initializing application.
app.listen(port, function() {
    console.log('etasked launched using port: ', ip + ':' + port);
});

module.exports = app;
