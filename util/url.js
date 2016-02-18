var settings = require('../settings');

var Url = module.exports = {};

/**
 * Returns a fully qualified url for a resource in the
 * static public directory.
 *
 * @param req
 * @param path
 * @param fileName (optional)
 */
Url.publicDirFileUrl = function (req, path, fileName) {
    path = encodeURIComponent(path).replace(/%2F/g, '/'); // keep slashes
    fileName = encodeURIComponent(fileName).replace(/%2F/g, '/'); // keep slashes
    var url = base = req.protocol + '://' + req.headers.host + '/public';
    path[0] === '/' ? url += path : url += '/' + path;
    if (typeof fileName === 'undefined' || fileName === null) return url;
    path[path.length -1] === '/' ? url += fileName : url += '/' + fileName;
    return url;
};

/**
 * Returns a fully qualified URL for an API endpoint.
 *
 * @param req - http request that is pending
 * @param path - the API path from he base of the URL
 * @returns {string} - the full URL to the endpoint
 */
Url.apiUrl = function (req, path) {
    path = encodeURIComponent(path).replace(/%2F/g, '/'); // keep slashes
    var base = req.protocol + '://' + req.headers.host;
    return path[0] === '/' ? base + path : base + '/' + path;
};

/**
 * Just makes sure a string ends with a /
 *
 * @param str - any string
 * @returns {string} - string with / ending
 */
Url.endWithSlash = function (str) {
    return str[str.length -1] === '/' ? str : str + '/';
};
