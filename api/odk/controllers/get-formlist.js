var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray: false, attrkey: "attributes"});
var createFormList = require('openrosa-formlist');
var getFormUrls = require('../helpers/get-form-urls');
var settings = require('../../../settings');
var fs = require('fs');

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
    var formId = req.query.formid;

    return getFormUrls(options, function (err, formUrls) {
        if (err) {
          return next(err);
        }

        var formListOptions = {
            headers: options.headers
        };

        return createFormList(formUrls, formListOptions, function (err, xml) {
            if (err) {
              // patch around openrosa-formlist not passing proper Errors
              if (!(err instanceof Error)) {
                err = new Error(err);
              }

              return next(err);
            }

            // Default is XML, but JSON is an option
            if (json) {
                return parser.parseString(xml, function (err, result) {
                    if (result === undefined) {
                        res.status(200).json(null);
                    } else {
                        if (typeof result.xforms.xform == "object") {

                            // make sure xform is an array
                            var xformarr = result.xforms.xform.length === undefined ? [result.xforms.xform] : result.xforms.xform;

                            addSubmissionCount(xformarr, function (xformJson) {
                                if(formId){
                                    result.xforms.xform = xformJson.filter(function(arr){
                                        return arr.formID == formId;
                                    });
                                } else {
                                    result.xforms.xform = xformJson;
                                }
                                res.status(200).json(result);
                            });
                        } else {
                            res.status(200).json(null);
                        }
                    }
                });
            }

            res.set('content-type', 'text/xml; charset=utf-8');
            res.status(200).send(xml);
        });
    });
};

/**
 * Get list of forms and add totalSubmissions property
 * @param xformJson
 */
function addSubmissionCount(xformJson, cb) {
    // loop through each form
    var count = 0;
    xformJson.forEach(function (form) {
        // add totalSubmission to xformJson object
        form.totalSubmissions = 0;
        // loop thourgh each forms submission directory
        fs.readdir(settings.dataDir + '/submissions/' + form.formID, function (err, files) {
            if (err) {
                console.log('Form: ' + form.formID + ' has no submissions.');
            } else {
                // add number of files as total submissions
                form.totalSubmissions = directoryCount(files);
                // return xformsJson after looping through all forms
            }
            if (++count === xformJson.length) {
                cb(xformJson);
            }
        });
    })
}

/**
 * The number of submissions is the number of directories in the submission directory.
 * We could be really correct and use fs.stat, but this should suffice.
 *
 * @param files
 */
function directoryCount(files) {
    var count = 0;
    for (var i = 0, len = files.length; i < len; i++) {
        var f = files[i];
        // dont show hidden files like .DS_Store and files with extensions
        if (f.indexOf('.') > -1) continue;
        ++count;
    }
    return count;
}
