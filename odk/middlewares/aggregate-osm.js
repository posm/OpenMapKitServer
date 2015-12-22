const fs = require('fs');
const libxml = require('libxmljs');
const appVersion = require('../../package').version;

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
module.exports = function (files, filter, cb) {
    const numFiles = files.length;

    // Empty OSM XML if no files.
    if (numFiles === 0) {
        cb('<?xml version="1.0" encoding="UTF-8" ?><osm version="0.6" generator="OpenMapKit Server"></osm>');
    }

    var filesCompleted = 0;
    const mainXmlDoc = new libxml.Document();
    mainXmlDoc.node('osm').attr({
        version: '0.6',
        generator: 'OpenMapKit Server ' + appVersion
    });

    const mainOsmElement = mainXmlDoc.root();

    for (var i = 0; i < numFiles; i++) {
        fs.readFile(files[i], 'utf-8', function (err, xml) {
            if (err) {
                cb(err);
                return;
            }

            var doc = libxml.parseXmlString(xml);
            var osmElements = doc.root().childNodes();
            for (var j = 0, len = osmElements.length; j < len; j++) {
                var osmElement = osmElements[j];
                mainOsmElement.addChild(osmElement);
            }
            ++filesCompleted;
            if (filesCompleted === numFiles) {
                cb(null, mainXmlDoc.toString());
            }
        });
    }

};
