var builder = require('xmlbuilder');

var settings = require('../../../settings');
var pkg = require('../../../package');

module.exports = function (submissionsDir) {
    var createdBy = 'OpenMapKit Server v' + pkg.version;
    var omkPath = '';

    return builder.create('root', {version: '1.0', encoding: 'UTF-8'})
        .ele('osm', {version: 0.6})
            .ele('changeset')
                .ele('tag', {k: 'testkey', v: 'testval'})
        .end({ pretty: true});

};
