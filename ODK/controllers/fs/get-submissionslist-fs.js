const fs = require('fs');
const settings = require('../../../settings');

/**
 * Provides metadata as JSON of the public directories of
 * survey submissions as well as the applicable aggregate
 * endpoints.
 */
module.exports = function (req, res, next) {
    const dir = settings.publicDir + '/submissions/';
    fs.readdir(dir, function (err, files) {
        const urls = [];
        if (err) res.status(500).json(err);
        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];
            if (file[0] === '.') continue;
            urls.push(req.protocol + '://' + req.headers.host + req.originalUrl + '/' + file + '.json');
        }
        res.status(200).json(urls);
    });
};
