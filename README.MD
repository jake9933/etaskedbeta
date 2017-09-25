(http://www.etasked.com)

[![NPM](https://img.shields.io/badge/build-npm-red.svg?style=flat-square)](https://docs.npmjs.com/cli/install)
[![Express](https://img.shields.io/badge/dependencies-express-green.svg?style=flat-square)](https://expressjs.com/)
[![Etasked](https://img.shields.io/badge/development-mvp-FF5555.svg?style=flat-square)](http://www.etasked.com) 

Built modularly with a load balancer in front of two web servers, we can horizontally scale applications by bring up new web servers and putting them behind the load balancer. Now the requests are spread across more machines, meaning each one is doing less work overall creating less stress to prevent bottlenecking. 
Agile software development mainly targets complex systems and product development with dynamic, non-linear characteristics. Using trello management for tasks, we are able to pick up stories for working on a team and manage productivity. 
We used cloud 9 as a development environment to live-edit code and to modify and share the same servers. Our version control is setup via github and we’ve managed to communicate our progress and voice through a web application called discord.

*See [google style](https://github.com/google/styleguide) for the standard settings on [javascript](https://github.com/google/styleguide/blob/gh-pages/javascriptguide.xml) for [ES6](http://es6-features.org).*

## Setup

```
  $ npm install
  $ sudo service postgresql start
  $ createdb etasked
  $ knex migrate:latest
  $ knex seed:run
```

*After the databse and migrations are initialized run __server.js__ to start the application.*

*Information about the server we are running can be found [here](package.json). Check the package.json to view recommended environment for production.*

## Technologies

```
angular.js
bootstrap framework
node.js
express.js
handlebars.js
knex.js
postgreSQL
aws EC2
docker
```

#### Frontend Framework

Bootstrap is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.
Databinding in AngularJS apps is the automatic synchronization of data between the model and view components.
Web apps that load a single HTML page and dynamically update that page as the user interacts with the app. SPAs use AJAX and HTML5 to create fluid and responsive Web apps, without constant page reloads.

#### Server Backend

Express is a framework built off node.js which is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications built on semantic templates that run across all devices.
A RESTful API -- also referred to as a RESTful web service -- is based on representational state transfer  technology, an architectural style and approach to communications often used in web services development.

## Team
  &nbsp; &nbsp;
  <a href="https://github.com/benneb1"><img src="https://avatars0.githubusercontent.com/u/29782381?v=3&s=200" alt="Jacob Handley, jake9933"/></a>
  &nbsp;&nbsp;
  <a href="https://github.com/klemms"><img src="https://avatars0.githubusercontent.com/u/30067246?v=3&s=200" alt="Robert Johnson, Robertnj"/></a>
</p>

## License

Private License (c) 2017 [ETASKED](http://www.etasked.com)


## Links

- [website](http://etasked.com)
- [presentation](https://docs.google.com/presentation/d/1QcnotfUTKdTPGj1iniFJ9K2YhWu_4F4x1ZOv8Zd1144/edit?usp=sharing)
- [notes](https://docs.google.com/document/d/1pkozxR4Yq8JYRKsaQSuZ5Ujcw5KJ1f_s_gKzDrKBEA8)
- [trello](https://trello.com/b/TjVKXUAU/etasked)
- [workspace](https://ide.c9.io/nutiler/etasked)
- [cloud 9](https://etasked-nutiler.c9users.io)
- [github](https://github.com/nutiler/etasked)
- [discord](https://discord.gg/S7FBmrG)
