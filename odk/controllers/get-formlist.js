const xml2js = require('xml2js');
const parser = new xml2js.Parser({explicitArray: false, attrkey: "attributes"});
const createFormList = require('openrosa-formlist');
const getFormUrls = require('../helpers/get-form-urls');

/**
 * Searches for XForm XML Files on the file system and
 * returns valid OpenRosa formList XML.
 */
module.exports = function (req, res, next) {
    var options = {
        headers: {
            'User-Agent': 'OpenMapKitServer'
        },
        baseUrl: req.protocol + '://' + req.headers.host + '/public/forms'
    };

    // Look for "json" query param
    var json = req.query.json || false;

    getFormUrls(options, function (err, formUrls) {
        if (err) return next(err);
        var formListOptions = {
            headers: options.headers
        };
        createFormList(formUrls, formListOptions, function(err, xml) {
            if (err) return next(err);

            // Default is XML, but JSON is an option
            if(json) {
                parser.parseString(xml, function (err, result) {
                    if (result === undefined) {
                        res.status(200).json(null);
                    } else {
                        res.status(200).json(result);
                    }
                });

            } else {
                res.set('content-type', 'text/xml; charset=utf-8');
                res.status(200).send(xml);
            }
        });
    });
};
