var config = require('config.json')('./vars.json');
var es = require('elasticsearch');
var fs = require('fs');
var log = require('console-log-level')(
  {
    prefix: function (level) {
      return new Date().toISOString() + " " + level.toUpperCase();
    },
    level: 'debug'
  });
var esclient = new es.Client(
  {
    host: config.es.host
  }
);

var addJson = function(res) {
  fs.readFile('input.json',
    function(err,data) {
      j = JSON.parse(data);
      createIndices();
      // createDocuments(config.es.indices.career,j.career);
      res.send("done\n");
    }
  );
}

/** creates indices as needed
**/
function createIndices() {
  var result = [];
  var indices = config.es.indices;
  var indicesToCreate = config.es.indices.length;
  log.debug("indicesToCreate " + indicesToCreate);
  for (var key in indices) {
    createIndexIfNeeded(indices[key],function(result){
      results.push(result);
      log.debug("result:" + result);
      if (--indicesToCreate == 0) {

      }

    });
  }
}

/**
Checks whether index is present in Elasticsearch, creates index if not.
**/
function createIndexIfNeeded(indexName,callback) {
  esclient.indices.exists({index: indexName},
    function(err,exists,status) {
      if (exists == false) {
        log.debug("index " + indexName + " does not exist");
        esclient.indices.create({index: indexName},
          function(err,resp,status) {
            log.info("index " + indexName + " created")
          }
        );
      } else {
        log.debug("index " + indexName + " already exists, not creating");
      }
      callback(resp);
    }
  );
}

function createDocumentIfNeeded(indexName,obj,callback) {
  log.debug(arguments.callee.name + " " + indexName + " " + JSON.stringify(obj));
  esclient.exists({
    index: indexName,
    type: obj.type,
    id: 1,
    body: obj
  }, function(err,resp,status){
    if (err) {log.trace(err)};
    if (resp == false) {
      esclient.create({
        index: indexName,
        type: obj.type,
        body: obj
      }, callback(err,resp,status));
    } else {
      log.debug("document already exists");
    }
  });

}

function createDocuments(indexName,objects) {
  var docsToAdd = objects.length;
  objects.forEach(function(obj) {
    log.debug("adding career: " + JSON.stringify(obj));
    createDocumentIfNeeded(indexName,obj,function(err,resp,status){
      if (err) { log.warn(err);}
      else { log.debug(resp); }
    });
  });
}

function createDocumentsOld(indexName,obj) {
  for (var i = 0; i < obj.length; i++) {
    log.debug("add document item: " + JSON.stringify(obj[i]));
    var param = {
      index: indexName,
      type: obj[i].type,
      id: i,
      body: obj[i]
    };
    esclient.exists(param, function(err,exists){
      if (exists == false) {
        log.debug("would have created " + JSON.stringify(param));
        esclient.create(param, function(err,resp,status){
          if (err) { log.warn(err);}
          else { log.debug(resp); }
        });
      } else {
        log.debug("document already exists");
      }
    });
  }
}


exports.addJson = addJson;
