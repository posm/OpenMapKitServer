const test = require('tape');
const fs = require('fs');
const aggregateOsm = require('../../../odk/middlewares/aggregate-osm');


/**
 * Get together an array of the simple set of OSM files to test.
 */
const simpleFiles = fs.readdirSync('./test/fixtures/osm/basic');
const simpleFilesPaths = [];
for (var i = 0, len = simpleFiles.length; i < len; i++) {
    var fName = simpleFiles[i];
    simpleFilesPaths.push('./test/fixtures/osm/basic/' + fName);
}

/**
 * Get together an array of OSM files with conflicting negative IDs to test.
 */
const conflictingIdFiles = fs.readdirSync('./test/fixtures/osm/conflicting-negative-ids');
const conflictingIdFilesPaths = [];
for (var j = 0, len2 = conflictingIdFiles.length; j < len2; j++) {
    var fName2 = conflictingIdFiles[i];
    conflictingIdFilesPaths.push('./test/fixtures/osm/conflicting-negative-ids/' + fName2);
}


test('aggregate-osm.js must concatenate 3 files and rewrite a negative ID.', function (t) {
    t.plan(2);
    aggregateOsm(simpleFilesPaths, null, function (err, xml) {
        t.error(err, 'Should not throw error.');
        const nodeWithNegId = '<node id="-1" action="modify" lat="1.0753199144383814" lon="34.16216178888775">';
        const idxRetVal = xml.indexOf(nodeWithNegId);
        t.ok(idxRetVal > 0, 'there is a node with a -1 id');
    });
});

test('aggregate-osm.js must rewrite the negative IDs of elements to maintain uniqueness.', function (t) {
    t.plan(2);
    aggregateOsm(conflictingIdFilesPaths, null, function (err, xml) {
        t.error(err, 'Should not throw error.');


        /**
         * Checking that all negative IDs are unique.
         */
        const regex = /id="-\d+"/gi;
        const idAttrStrs = [];
        var result;
        while ( (result = regex.exec(xml)) ) {
            idAttrStrs.push(result[0]);
        }
        // keys are ids so we can see if we have an aformentioned id
        const idHash = {};
        for (var k = 0, len3 = idAttrStrs.length; k < len3; k++) {
            // ex: id="-1"
            var idAttrStr = idAttrStrs[k];
            var idInt = parseInt(idAttrStr.split('id="')[1]);
            // checking if id is already in hash
            if (idHash[idInt]) {
                t.fail('We found a duplicate negative ID: ' + idInt);
            } else {
                idHash[idInt] = true;
            }
        }
        t.pass('Check that all negative IDs unique passed.');
        
    });
});
