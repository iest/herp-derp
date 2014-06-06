/*
  TODO:
  - Watcher for posts dir, add/edit/delete
  - To add to config:
    - Posts dir option
    - Allowed filename extensions for posts
    - View directory
    - View filename extension
 */

// Dependencies
var _ = require('lodash');
var route = require('koa-route');
var logger = require('koa-logger');
var gaze = require('gaze');
var koa = require('koa');
var port = process.argv[2] || 3000;
var app = koa();

// Custom dependencies
var render = require('./lib/renderer');
var parsePosts = require('./lib/parse-all-posts');

// Middleware
app.use(logger());

// Routes
app.use(route.get('/', list));
app.use(route.get('/:url', show));

var postsArr = [];
var postsMap = {};

// All-view locals
var locals = {
  moment: require('moment')
};

// Server methods
function * list() {
  this.body = yield render('list', _.extend(locals, {
    posts: postsArr
  }));
}

function * show(url) {
  var post = postsArr[postsMap[url]];
  if (!post) this.throw(404, 'Post not found');
  this.body = yield render('post', _.extend(locals, {
    post: post
  }));
}

// Now init the server
(function init() {
  parsePosts('./posts')
    .then(function(posts) {
      postsArr = posts;

      postsArr.forEach(function(post, i) {
        postsMap[post.url] = i;
      });

      app.listen(port);
      console.log('Listening on port', port);

    }, function(err) {
      console.log(err);
    });

  // Watch all .js files/dirs in process.cwd()
  // gaze(['./posts/*.md', './posts/'], function(err, watcher) {
  //   // Files have all started watching
  //   // watcher === this

  //   // Get all watched files
  //   this.watched(function(err, watched) {
  //     console.log("watching", watched);
  //   });

  //   // On file changed
  //   this.on('changed', function(filepath) {
  //     console.log(filepath + ' was changed');
  //   });

  //   // On file added
  //   this.on('added', function(filepath) {
  //     console.log(filepath + ' was added');
  //   });

  //   // On file deleted
  //   this.on('deleted', function(filepath) {
  //     console.log(filepath + ' was deleted');
  //   });

  //   // On changed/added/deleted
  //   this.on('all', function(event, filepath) {
  //     console.log(filepath + ' was ' + event);
  //   });
  // });
})();