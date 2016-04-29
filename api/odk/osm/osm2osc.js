var fs = require('fs');
var async = require('async');
var xml2js = require('xml2js');

var pkg = require('../../../package');
var version = pkg.version;

module.exports = function(osmXmlFiles, cb) {

    /**
     * This is the object used by xml2js which will
     * be ultimately turned into an XML string by
     * the xml2js.Builder.
     *
     * @type {{osmChange: {$: {version: string, generator: string}, create: {}, modify: {}, delete: {}}}}
     */
    var obj = {
        osmChange: {
            $: {
                version: '0.6',
                generator: 'OpenMapKit Server ' + version
            },
            create: {
                node: [],
                way: [],
                relation: []
            },
            modify: {
                node: [],
                way: [],
                relation: []
            },
            delete: {
                $: {
                    'if-unused': 'true'
                },
                node: [],
                way: [],
                relation: []
            }
        }
    };

    /**
     * Going through all of the OSM XML files for a submission (in parallel).
     * Builds the OSC XML string when all of the OSM XML files are read
     * and processed.
     */
    async.each(osmXmlFiles, function (file, cb) {
        fs.readFile(file, 'utf-8', function (err, osmXmlStr) {
            if (err) {
                cb(err)
            }

            var parser = new xml2js.Parser();

            parser.parseString(osmXmlStr, function (err, result) {
                var osm = result.osm;
                var nodes = osm.node || [];
                var ways = osm.way || [];
                var relations = osm.relation || [];

                for (var i = 0, nlen = nodes.length; i < nlen; i++) {
                    placeOsmElement(nodes[i], obj, 'node');
                }
                for (var j = 0, wlen = ways.length; j < wlen; j++) {
                    placeOsmElement( ways[j], obj, 'way');
                }
                for (var k = 0, rlen = relations.length; k < rlen; k++) {
                    placeOsmElement(relations[k], obj, 'relation');
                }

                cb();
            });
            

        });
    }, function (err) {  // Done with all of the OSM XML Files.
        if (err) {
            cb(err);
            return;
        }

        var builder = new xml2js.Builder({
            renderOpts: {
                pretty: false
            },
            headless: true
        });
        var xml = builder.buildObject(obj);

        cb(null, xml);
    });
};

/**
 * Looks at the action tag in JOSM OSM file
 * and places it in the right osmChange node.
 *
 * Elements that are not modified or deleted
 * are ignored, since they did not change.
 *
 * Note: OSM Elements without an action
 *       should not make it into the osc.
 *
 * @param el - osm element
 * @param obj - xml2js object
 * @param type - type of osm element
 */
function placeOsmElement(el, obj, type) {
    var action = el.$.action;
    if (action === 'modify') {
        // negative element means that it is new
        if (parseInt(el.$.id) < 0) {
            obj.osmChange.create[type].push(el);
        }
        // otherwise, it already exists and has been modified
        else {
            obj.osmChange.modify[type].push(el);
        }
        return;
    }
    if (action === 'delete') {
        obj.osmChange.delete[type].push(el);
    }
    // regardless, osc doesnt have the action attribute
    delete el.$.action;
}
