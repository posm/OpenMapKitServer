var test = require('tape');
var fs = require('fs');
var libxml = require('libxmljs');
var filterOsm = require('../../osm/filter-osm');

/**
 * Get together an array of the simple set of OSM files to test.
 */
var simpleFiles = fs.readdirSync('./test/fixtures/osm/basic');
var simpleFilesXml = [];
for (var i = 0, len = simpleFiles.length; i < len; i++) {
    var fName = simpleFiles[i];
    var path = './test/fixtures/osm/basic/' + fName;
    var xml = fs.readFileSync(path, {encoding:'utf-8'});
    simpleFilesXml.push(xml);
}

test('filter-osm.js must find two users named "theoutpost" in basic osm fixture dir', function (t) {
    t.plan(2);
    var filter = {
        user: 'theoutpost'
    };
    for (var i = 0, len = simpleFilesXml.length; i < len; i++) {
        var xml = simpleFilesXml[i];
        var doc = libxml.parseXmlString(xml);
        var rootEl = doc.root();
        filterOsm.user(rootEl, filter, function (rootEl, bool) {
            if (bool) {
                t.pass('got "theoutpost" user');
            }
        });
    }
});
