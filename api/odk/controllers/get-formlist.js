var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray: false, attrkey: "attributes"});
var createFormList = require('openrosa-formlist');
var getFormUrls = require('../helpers/get-form-urls');
var settings = require('../../../settings');
var fs = require('fs');
var _ = require('underscore');

/**
 * Searches for XForm XML Files on the file system and
 * returns valid OpenRosa formList XML.
 */
module.exports = function (req, res, next) {
    var options = {
        headers: {
            'User-Agent': 'OpenMapKitServer'
        },
        baseUrl: req.protocol + '://' + req.headers.host + '/omk/data/forms'
    };

    // Look for "json" query param
    var json = req.query.json || false;

    getFormUrls(options, function (err, formUrls) {
        if (err) return next(err);
        var formListOptions = {
            headers: options.headers
        };
        createFormList(formUrls, formListOptions, function (err, xml) {
            if (err) return next(err);

            // Default is XML, but JSON is an option
            if (json) {
                parser.parseString(xml, function (err, result) {
                    if (result === undefined) {
                        res.status(200).json(null);
                    } else {
                        if (typeof result.xforms.xform == "object") {
                            addSubmissionCount(result.xforms.xform, function (xformJson) {
                                result.xforms.xform = xformJson;
                                res.status(200).json(result);
                            });
                        } else {
                            res.status(200).json(null);
                        }
                    }
                });

            } else {
                res.set('content-type', 'text/xml; charset=utf-8');
                res.status(200).send(xml);
            }
        });
    });
};

/**
 * Get list of forms and add totalSubmissions property
 * @param xformJson
 */
function addSubmissionCount(xformJson, cb) {

    // loop through each form
    xformJson.forEach(function (form, index) {
        try {
            // add totalSubmission to xformJson object
            form = _.extend(form, {totalSubmissions: 0});
            var submissionsDir = fs.readdirSync(settings.dataDir + '/submissions/' + form.formID);
            form.totalSubmissions = submissionsDir.length;

            // return callback when end of xformJson array is reached
            if (index == xformJson.length - 1) {
                cb(xformJson);
            }
        } catch (err) {
            // will fire if directory doesn't exist (form has no submissions)
            // return callback when end of array is reached
            if (index == xformJson.length - 1) {
                cb(xformJson);
            }
        }
    })
}
