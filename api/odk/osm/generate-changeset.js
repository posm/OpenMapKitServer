var builder = require('xmlbuilder');

var settings = require('../../../settings');
var pkg = require('../../../package');

module.exports = function (submissionsDir) {
    var createdBy = 'OpenMapKit Server v' + pkg.version;
    var omkPath = '';

    return builder.create('osm', {version: '1.0', encoding: 'UTF-8'})
        .att({version: '0.6'})
        .ele('changeset')
            .ele('tag', {k: 'testkey', v: 'testval'})
            .insertAfter('tag', {k: 'testkey2', v: 'testval2'})
        .end({ pretty: true});

};
