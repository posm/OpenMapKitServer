'use strict';

module.exports = function() {
    return function(req, res, next) {
        // These headers are required according to https://bitbucket.org/javarosa/javarosa/wiki/OpenRosaRequest
        res.setHeader('X-OpenRosa-Version', '1.0');
        res.setHeader('Location', locationUrl(req));

        next();
    };
};

function httpOrHttps(req) {
    if (req.headers['x-forwarded-proto']) {
        return req.headers['x-forwarded-proto'] + '://';
    }
    return req.connection.encrypted ? 'https://' : 'http://';
}

function locationUrl(req) {
    var host = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host;
    return httpOrHttps(req) + host + req.originalUrl;
}
