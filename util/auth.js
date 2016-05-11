/**
 *  https://davidbeath.com/posts/expressjs-40-basicauth.html
 */

var basicAuth = require('basic-auth');
var settingsAuth = require('../settings').auth;

module.exports = function (req, res, next) {
    // let 'em through if no auth is specified in settings...
    if (typeof settingsAuth !== 'object'
            || typeof settingsAuth.user !== 'string'
            || typeof settingsAuth.pass !== 'string') {
        return next();
    }

    var user = basicAuth(req);

    if (typeof user !== 'object' 
            || typeof user.name !== 'string' 
            || typeof user.pass !== 'string') {
        return unauthorized(res);
    }

    if (user.name.toLowerCase() === settingsAuth.user.toLowerCase() 
            && user.pass === settingsAuth.pass) {
        return next();
    } else {
        return unauthorized(res);
    }
};

function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
}
