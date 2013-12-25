
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

var articleProvider = new ArticleProvider('localhost', 27017);

app.get('/', function(req, res) {
  articleProvider.findAll(function(error, docs) {
    res.render('index.jade', {
      title: "Blog",
      articles: docs
    });
  });
});

app.get('/blog/new', function (req, res) {
  res.render('blog_new.jade', {
    title: 'New Post'
  });
});

app.post('/blog/new', function (req, res) {
  articleProvider.save({
    title: req.param('title'),
    body: req.param('body')
  }, function (error, docs) {
    res.redirect('/');
  });
});

app.get('/blog/:id', function (req, res) {
  articleProvider.findById(req.params.id, function (error, article) {
    res.render('blog_show.jade', {
      title: article.title,
      body: article.body
    });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
