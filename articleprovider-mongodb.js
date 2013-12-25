var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host, port) {
  var server = new Server(host, port, {auto_reconnect: true}, {});
  this.db = new Db('node-mongo-blog', server, {safe: false});
  this.db.open(function() {});
};

ArticleProvider.prototype.getCollection = function(callback) {
  this.db.collection('articles', callback);
};

ArticleProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, article_collection) {
    if (error) callback(error);
    else {
      article_collection.find().toArray(callback);
    }
  });
};


ArticleProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, article_collection) {
    if (error) callback(error);
    else {
      var objectId = article_collection.db.bson_serializer.ObjectID.createFromHexString(id);
      article_collection.findOne({_id: objectId}, callback);
    }
  });
};

ArticleProvider.prototype.save = function(articles, callback) {
  this.getCollection(function(error, article_collection) {
    if (error) callback(error);
    else {
      if (typeof(articles.length) == "undefined")
        articles = [articles];

      for (var i = 0; i < articles.length; i++) {
        article = articles[i];
        article.created_at = new Date();
        if (article.comments === undefined) article.comments = [];
        for (var j = 0; j < article.comments.length; j++) {
          article.comments[j].created_at = new Date();
        }
      }

      article_collection.insert(articles, callback);
    }
  });
};

exports.ArticleProvider = ArticleProvider;
