var fs = require('fs')
  , jade = require('jade')
  , path = require('path')
  , v8tools = require('v8tools')
  ;

exports = module.exports = function(timeout, cb) {
  v8tools.startV8Profiler();
  setTimeout(function() {
    var nodes = {}
      , tree = null
      , treeSamplesCount = null
      ;

    v8tools.stopV8Profiler(function(parentCallUid, callUid, totalSamplesCount, functionName, scriptResourceName, lineNumber){
      var cpuUsage
        , node
        ;

      if (treeSamplesCount === null) {
        treeSamplesCount = totalSamplesCount
      }
      cpuUsage = ((totalSamplesCount * 100) / treeSamplesCount || 1);
      node = {
        cpuUsage: cpuUsage,
        totalSamplesCount: totalSamplesCount,
        functionName: functionName,
        scriptResourceName: scriptResourceName,
        lineNumber: lineNumber,
        children: []
      };
      nodes[callUid] = node;
      if (tree === null) {
        tree = node;
      }
      if (parentCallUid && nodes[parentCallUid]) {
        nodes[parentCallUid].children.push(node);
      }
    });
    fs.readFile(path.resolve(__dirname, 'views/index.jade'), 'utf8', function(err, template) {
      if (err) {
        return cb(err);
      }
      var html = jade.compile(template)({tree: tree});
      cb(null, html);
    });
  }, timeout);
};