/**
reference:
http://bigspaceship.github.io/blog/2014/05/14/how-to-create-a-rest-api-with-node-dot-js/
**/
var log = require('console-log-level')(
  {
    prefix: function (level) {
      return new Date().toISOString() + " " + level.toUpperCase();
    },
    level: 'debug'
  });
var express = require('express');
var add = require('./add');
var addjson = require('./addjson');
var app = express();
app.get('/', function(req, res) {
  res.send('Hello Seattle\n');
});

/**
Display health info about elasticsearch
**/
app.get('/info',
  function(req,res) {
    var esclient = require("./es.js");
    esclient.ping(
      function(resp) {
        log.debug(resp);
        res.send(resp);
      }
    );
  }
);

/**
Display a form
Hitting Submit makes a POST request to /add
**/
app.get('/add',
  function(req,res) {
    add.displayForm(res);
  }
);

/**
Accept submitted form
**/

app.post('/add',
  function(req,res) {
    add.parseFormFields(req,res);
  }
);

app.get('/addjson',
  function(req,res) {
    addjson.addJson(res);
  }
);

app.listen(3001);
log.info('Listening on port 3001...');
