const settings = require('../settings');

const Url = module.exports = {};

/**
 * Returns a fully qualified url for a resource in the
 * static public directory.
 *
 * @param req
 * @param path
 * @param fileName
 */
Url.publicDirFileUrl = function (req, path, fileName) {
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
    const base = req.protocol + '://' + req.headers.host;
    return path[0] === '/' ? base + path : base + '/' + path;
};
