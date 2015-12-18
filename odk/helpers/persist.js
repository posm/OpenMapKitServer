// Saves a file to the local filesystem

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const stream = require('stream');

module.exports = function (data, options, callback) {
    const filename = options.filesystem.path + options.filename;
    mkdirp(path.dirname(filename), function (err) {
        if (err) console.error(err);
        if (data instanceof stream.Readable) {
            var fileStream = fs.createWriteStream(filename)
            data.pipe(fileStream)
            data.on('end', callback)
        } else {
            console.log('writing to ' + filename)
            fs.writeFile(filename, data, callback)
        }
    });
}
