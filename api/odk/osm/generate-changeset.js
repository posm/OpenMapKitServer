var builder = require('xmlbuilder');

var settings = require('../../../settings');
var pkg = require('../../../package');
var version = pkg.version;

module.exports = function (submissionsDir) {
    var dataDir = '/omk/data' + submissionsDir.split('data')[1] + '/';
    var dirParts = submissionsDir.split('/');

    var tags = {};
    tags.created_by = 'OpenMapKit Server ' + version;
    tags.type = 'survey';
    tags.uri = dataDir + 'data.json';
    tags.form = submissionsDir.split('submissions/')[1].split('/')[0];
    tags.instance_id = dirParts[dirParts.length-1];
    if (settings.hostUrl) {
        tags.url = settings.hostUrl + tags.uri;
    }
    tags.comment = tags.created_by + ' ' + tags.form + ' submission. ' + tags.instance_id;

    var changeset = builder.create('osm', {version: '1.0', encoding: 'UTF-8'})
        .att({version: '0.6'})
        .ele('changeset');

    for (var k in tags) {
        changeset.ele('tag', {k: k, v: tags[k]});
    }
    
    return changeset.end();
};
