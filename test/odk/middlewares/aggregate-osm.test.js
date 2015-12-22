const test = require('tape');
const fs = require('fs');
const aggregateOsm = require('../../../odk/middlewares/aggregate-osm');

const simpleFiles = fs.readdirSync('./test/fixtures/osm/basic');
const simpleFilesPaths = [];
for (var i = 0, len = simpleFiles.length; i < len; i++) {
    var fName = simpleFiles[i];
    simpleFilesPaths.push('./test/fixtures/osm/basic/' + fName);
}

test('Check to see aggregate-osm concatenate 3 files and rewrite a negative ID.', function (t) {
    t.plan(2);
    aggregateOsm(simpleFilesPaths, null, function (err, xml) {
        t.error(err, 'Should not throw error.');
        const nodeWithNegId = '<node id="-1" action="modify" lat="1.0753199144383814" lon="34.16216178888775">';
        const idxRetVal = xml.indexOf(nodeWithNegId);
        t.ok(idxRetVal > 0, 'there is a node with a -1 id');
    });
});
