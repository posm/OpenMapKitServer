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
    return req.connection.encrypted ? 'https://' : 'http://';
}

function locationUrl(req) {
    return httpOrHttps(req) + req.headers.host + req.originalUrl;
}
