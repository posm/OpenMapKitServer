var fs = require('fs');
var path = require('path')
var libxml = require('libxmljs');
var appVersion = require('../../../package').version;
var filterOsm = require('./filter-osm');

var CHUNK_SIZE = 500;

/**
 * aggregate-osm.js
 *
 * Aggregates a list of JSOM formatted OSM edit files into a single OSM XML.
 * A filter can be applied to get a subset of the OSM edits in question.
 * The resultant single OSM is fed to the callback.
 *
 * @param files   - OSM Files to aggregate
 * @param filter  - Object that specifies elements to include - no filter if null
 * @param cb      - Final aggregated OSM XML.
 */
module.exports = function(files, filter, cb) {
  var numFiles = files.length;

  // Empty OSM XML if no files.
  if (numFiles === 0) {
    cb(null, '<?xml version="1.0" encoding="UTF-8" ?><osm version="0.6" generator="OpenMapKit Server ' + appVersion + '"></osm>');
  }

  // This is the number of files read so far.
  // This includes files that have been filtered out of the result.
  var filesCompleted = 0;

  // This is the number of files that have made it to the final main
  // OSM element and passed the filters. We use this for the limit filter.
  var filesUsed = 0;

  var limitReached = false;
  var filesLimit = Number.POSITIVE_INFINITY;
  if (typeof filter.limit === 'string') {
    var limit = parseInt(filter.limit);
    if (limit >= 0) {
      filesLimit = limit;
    }
  }

  var mainXmlDoc = new libxml.Document();
  mainXmlDoc.node('osm').attr({
    version: '0.6',
    generator: 'OpenMapKit Server ' + appVersion
  });
  var mainOsmElement = mainXmlDoc.root();

  var negIdRewriteHash = {
    counter: -1
  };

  /**
   * We don't want to process all of the files in parallel at once,
   * because we will eventually reach the limit of number of files
   * that can be simultaneously read by the system. We chunk it out
   * into smaller concurrent batches.
   *
   * @param chunkOfFiles - a slice of the files fed to this module
   * @param remainingFiles - a slice of the files that should be read in subsequent recursive calls
   */
  function processChunksOfFiles(chunkOfFiles, remainingFiles) {
    if (limitReached) return;
    var chunkLen = chunkOfFiles.length;
    var filesInChunkCompleted = 0;

    chunkOfFiles.forEach(function(f) {
      /* The file filter checks the birthtime timestamp. If we want the file,
       * we get a bool of true in the callback.
       */
      filterOsm.file(f, filter, function(filePath, bool) {

        function checkToFireCallbacks() {
          ++filesCompleted;
          ++filesInChunkCompleted;
          // if every single file is done
          if (filesUsed === filesLimit || filesCompleted === numFiles) {
            if (!limitReached) {
              cb(null, mainXmlDoc.toString());
              limitReached = true;
            }
          }
          // if every file in chunk is done
          else if (filesInChunkCompleted === chunkLen && remainingFiles.length > 0) {
            processChunksOfFiles(
              remainingFiles.slice(0, CHUNK_SIZE),
              remainingFiles.slice(CHUNK_SIZE)
            );
          }
        }

        if (!bool) {
          checkToFireCallbacks();
          return;
        }
        fs.readFile(filePath, 'utf-8', function(err, xml) {
          if (limitReached) return;
          if (err) {
            cb(err);
            return;
          }
          if (typeof xml !== 'string' || xml.length === 0) {
            checkToFireCallbacks();
            return;
          }
          try {
            var doc = libxml.parseXmlString(xml);
            var rootEl = doc.root();
            filterOsm.user(rootEl, filter, function(rootEl, bool) {
              if (!bool) {
                checkToFireCallbacks();
                return;
              }

              var formData = JSON.parse(
                fs.readFileSync(
                  path.join(path.dirname(filePath), 'data.json'),
                  'utf8'
                )
              );

              var osmElements = rootEl.childNodes();
              for (var j = 0, len = osmElements.length; j < len; j++) {
                var osmElement = osmElements[j];
                // Check that the element is a node, way, or relation.
                var elementName = osmElement.name();
                if (elementName === 'node') {
                  rewriteNegativeId(negIdRewriteHash, osmElement);
                } else if (elementName === 'way' || elementName === 'relation') {
                  rewriteNegativeId(negIdRewriteHash, osmElement);
                  // Ways and relations might need their negative refs rewritten too.
                  rewriteNegativeRef(negIdRewriteHash, osmElement);
                }
                // add submission_time and submission_user or submission_deviceid
                // to each feature with the aim of showing this information on the map
                osmElement.node('tag').attr({
                  k: 'submission_date',
                  v: formData.meta.submissionTime.slice(0,10)
                });
                if (formData.username) {
                  osmElement.node('tag').attr({
                    k: 'submission_user',
                    v: formData.username
                  });
                } else {
                  osmElement.node('tag').attr({
                    k: 'submission_deviceid',
                    v: formData.deviceid
                  });
                }
                mainOsmElement.addChild(osmElement);
              }
              ++filesUsed;
              checkToFireCallbacks();
            });
          } catch (err) {
            cb(err);
            return;
          }

        });
      });

    });
  }

  processChunksOfFiles(files.slice(0, CHUNK_SIZE), files.slice(CHUNK_SIZE));

};

/**
 * Rewrites the id attribute with a fresh negative ID for
 * OSM Elements with a negative ID.
 *
 * @param negIdRewriteHash - lookup table where key is old ID, and value is new ID
 * @param osmElement - the OSM XML Element we are processing
 */
function rewriteNegativeId(negIdRewriteHash, osmElement) {
  var idAttr = osmElement.attr('id');
  if (!idAttr) return;
  var id = parseInt(idAttr.value());
  if (id >= 0) return;
  negIdRewriteHash[id] = negIdRewriteHash.counter;
  idAttr.value(negIdRewriteHash.counter--);
}

/**
 * Ways and relation members may have references to negative
 * IDs that have just been rewritten to assure uniqueness.
 * We look at the negIdRewriteHash and reassign the ref
 * value so that it contains a reference to the new ID value.
 *
 * @param negIdRewriteHash - lookup table where key is old ID, and value is new ID
 * @param osmElement - the OSM XML Element we are processing
 */
function rewriteNegativeRef(negIdRewriteHash, osmElement) {
  var children = osmElement.childNodes();
  for (var i = 0, len = children.length; i < len; i++) {
    // A child can be a nd, member, or tag.
    var child = children[i];
    var refAttr = child.attr('ref');
    if (!refAttr) continue;
    var ref = parseInt(refAttr.value());
    if (ref >= 0) continue;
    var rewriteRef = negIdRewriteHash[ref];
    if (typeof rewriteRef !== 'undefined' && rewriteRef !== null) {
      refAttr.value(rewriteRef);
    }
  }
}
