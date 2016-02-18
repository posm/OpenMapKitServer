var fs = require('fs');
var path = require('path');
var blacklistHelper = require('../odk/helpers/checksum-hash');
var formHash = blacklistHelper.get();
var filter = module.exports = {};

/**
 * Gets stats on a file, and filters it based on `submitTimeStart`
 * and `submitTimeEnd` filter parameters.
 *
 * @param filePath - Path to OSM file on the file system
 * @param filterObj - Parameters to filter by
 * @param cb - Callback object with `filePath` and `bool` value
 */
filter.file = function (filePath, filterObj, cb) {

    // Get path metadata, get the form name from path, get the form blacklist
    var pathMeta = path.parse(filePath);
    var parsedPath = pathMeta.dir.split('/');
    var formName = parsedPath[parsedPath.length - 2];
    var formBlacklist = formHash.get(formName) || null;


    // if a blacklist for this form exists and the filename is found in the blacklist, filter it.
    if(formBlacklist && formBlacklist.has(pathMeta.name)) {
        cb(filePath, false);
        return;
    }

    // if there is no filter
    if (typeof filterObj !== 'object' || filterObj === null) {
        cb(filePath, true);
        return;
    }

    fs.stat(filePath, function (err, stats) {
        // lets just let it pass through in err state
        if (err) {
            cb(filePath, true);
            return;
        }

        var submitTime = stats.birthtime.getTime();

        if (typeof filterObj.submitTimeStart === 'string' && typeof filterObj.submitTimeEnd === 'string') {
            var submitTimeStart = new Date(filterObj.submitTimeStart).getTime();
            var submitTimeEnd = new Date(filterObj.submitTimeEnd).getTime();
            // if invalid start time
            if (isNaN(submitTimeStart)) {
                cb(filePath, false);
                return;
            }
            // if invalid end time
            if (isNaN(submitTimeEnd)) {
                cb(filePath, false);
                return;
            }
            if (submitTime >= submitTimeStart && submitTime <= submitTimeEnd) {
                cb(filePath, true);
                return;
            }
            cb(filePath, false);
            return;
        }

        if (typeof filterObj.submitTimeStart === 'string') {
            var submitTimeStart = new Date(filterObj.submitTimeStart).getTime();
            // if invalid start time
            if (isNaN(submitTimeStart)) {
                cb(filePath, false);
                return;
            }
            if (submitTime >= submitTimeStart) {
                cb(filePath, true);
                return;
            }
            cb(filePath, false);
            return;
        }

        if (typeof filterObj.submitTimeEnd === 'string') {
            var submitTimeEnd = new Date(filterObj.submitTimeEnd).getTime();
            // if invalid end time
            if (isNaN(submitTimeEnd)) {
                cb(filePath, false);
                return;
            }
            if (submitTime <= submitTimeEnd) {
                cb(filePath, true);
                return;
            }
            cb(filePath, false);
            return;
        }


        // No submission time filter, pass through
        cb(filePath, true);

    });
};


/**
 * Filters JOSM OSM Edit files by the user attribute OMK Android
 * puts in the root OSM element.
 *
 * @param rootOsmElement - the root OSM object
 * @param filterObj - we want to have a user filter specified in the filter object
 * @param cb - Callback object with the `rootOsmElement` and `bool` value
 */
filter.user = function (rootOsmElement, filterObj, cb) {
    // if there is no filter
    if (typeof filterObj !== 'object' || filterObj === null) {
        cb(rootOsmElement, true);
        return;
    }
    if (typeof filterObj.user === 'string') {
        var userAttr = rootOsmElement.attr('user');
        // userAttr is not an attribute for the OSM edit, we dont want it
        if (userAttr === null) {
            cb(rootOsmElement, false);
            return;
        }
        var user = userAttr.value();
        if (user.toLowerCase() != filterObj.user.toLowerCase()) {
            cb(rootOsmElement, false);
            return;
        }
    }

    // no user filter, pass through
    cb(rootOsmElement, true);
};
