const test = require('tape');
const fs = require('fs');
const aggregateOsm = require('../../osm/aggregate-osm');


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

/**
 * Several OSM files with conflicting negative IDs as well as corresponding way and relation
 * references that also need to be rewritten.
 */
const rewriteNegativeRefFiles = fs.readdirSync('./test/fixtures/osm/rewrite-negative-refs');
const rewriteNegativeRefFilesPaths = [];
for (var l = 0, len4 = rewriteNegativeRefFiles.length; l < len4; l++) {
    var fName3 = rewriteNegativeRefFiles[l];
    rewriteNegativeRefFilesPaths.push('./test/fixtures/osm/rewrite-negative-refs/' + fName3);
}


test('aggregate-osm.js must concatenate 3 files and rewrite a negative ID.', function (t) {
    t.plan(2);
    aggregateOsm(simpleFilesPaths, null, function (err, xml) {
        t.error(err, 'Should not throw error.');
        const nodeWithNegId = '<node id="-1" action="modify" lat="1.0753199144383814" lon="34.16216178888775">';
        const idxRetVal = xml.indexOf(nodeWithNegId);
        t.ok(idxRetVal > 0, 'There is a node with a -1 id.');
    });
});

test('aggregate-osm.js must rewrite the negative IDs of elements to maintain uniqueness.', function (t) {
    t.plan(2);
    aggregateOsm(conflictingIdFilesPaths, null, function (err, xml) {
        t.error(err, 'Should not throw error.');
        checkAllNegativeIDsAreUnique(t, xml);
    });
});

test('aggregate-osm.js must update the refs to rewritten negative IDs for both ways and relation members.', function (t) {
    t.plan(3);
    aggregateOsm(rewriteNegativeRefFilesPaths, null, function (err, xml) {
        t.error(err, 'Should not throw error.');
        var idHash = checkAllNegativeIDsAreUnique(t, xml);
        checkAllNegativeRefsHaveCorrespondingId(t, xml, idHash);
    });
});


/**
 * Checking that all negative IDs are unique.
 *
 * @param t     - test callback object
 * @param xml   - the xml string in question
 */
function checkAllNegativeIDsAreUnique(t, xml) {
    const regex = /id="-\d+"/gi;
    const idAttrStrs = [];
    var result;
    while (result = regex.exec(xml)) {
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
            return;
        } else {
            idHash[idInt] = true;
        }
    }
    t.pass('All negative IDs are unique.');
    return idHash;
}

/**
 *
 * @param t      - test callback object
 * @param xml    - the xml string in question
 * @param idHash - a hash with all the ids as keys and true as values
 */
function checkAllNegativeRefsHaveCorrespondingId(t, xml, idHash) {
    const regex = /ref="-\d+"/gi;
    const refAttrStrs = [];
    var result;
    while (result = regex.exec(xml)) {
        var refAttrStr = result[0];
        var refInt = parseInt(refAttrStr.split('ref="')[1]);
        if (!idHash[refInt]) {
            t.fail('We have a negative ref without a corresponding ID: ' + refInt);
            return;
        }
    }
    t.pass('All negative refs have a corresponding ID.');
}
