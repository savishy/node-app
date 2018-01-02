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
    async function(err,data) {
      j = JSON.parse(data);
      var allIndicesCreated = await createIndices();
      if(allIndicesCreated) {
          var allDocsCreated = await createDocuments(config.es.indices.career,j.career);
      }
      res.send("result: indices created: " + allIndicesCreated + "docs created" + allDocsCreated + "\n");
    }
  );
}

/** creates indices as needed
**/
async function createIndices() {
  var result = [];
  var indices = config.es.indices;
  var indicesToCreate = Object.keys(config.es.indices).length;
  log.debug("indicesToCreate " + indicesToCreate);
  for (var key in indices) {
    createIndexIfNeeded(indices[key]);
  }

  return new Promise(function(resolve,reject){
    resolve(true);
  });
}

/**
Checks whether index is present in Elasticsearch, creates index if not.
**/
async function createIndexIfNeeded(indexName) {
  var existsResponse = await esclient.indices.exists({index: indexName});
  if (existsResponse == false) {
    var createResponse = await esclient.indices.create({index: indexName});
    log.debug(arguments.callee.name + " " +
      indexName + " exists? " + existsResponse +
      "created? " + JSON.stringify(createResponse));
  }
}

async function createDocuments(indexName,objects) {
  log.debug(arguments.callee.name + " for: " + indexName);
  var i = 0;
  objects.forEach(function(obj) {
    createDocumentIfNeeded(i,indexName,obj);
    i++;
  });

  return new Promise(function(resolve,reject){
    resolve(true);
  });

}

async function createDocumentIfNeeded(id,indexName,obj) {
  var param = {
    index: indexName,
    type: config.es.indextype,
    id: id,
    body: obj
  };
  var existsResponse = await esclient.exists(param);
  log.debug(arguments.callee.name + " " + existsResponse);
  if (existsResponse == false) {
    var createResponse = await esclient.create(param);
    log.debug(createResponse);
  } else {
    log.debug(arguments.callee.name + " document already exists");
  }
}



exports.addJson = addJson;
