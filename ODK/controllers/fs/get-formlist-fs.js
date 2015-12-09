const createFormList = require('openrosa-formlist');
const getFormUrls = require('../../helpers/get-form-urls-fs');

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

    getFormUrls(options, function (err, formUrls) {
        if (err) return next(err);
        var formListOptions = {
            headers: options.headers
        };
        createFormList(formUrls, formListOptions, function(err, xml) {
            if (err) return next(err);
            res.set('content-type', 'text/xml; charset=utf-8');
            res.status(200).send(xml);
        });
    });
};
