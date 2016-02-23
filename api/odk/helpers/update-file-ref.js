var traverse = require('traverse');

/**
 * Update references to media files in an xform to include a url to the file
 * stored on s3 Replaces the original filename with an object with the url and
 * the original filename
 * @param  {Object} form A json representation of an xform
 * @param  {Object} file Properties `originalFilename` and `url`
 */
function updateFileRef (form, file) {
    traverse(form).forEach(function (value) {
        if (file.originalFilename !== value) return;
        this.update({
            url: file.url,
            originalFilename: file.originalFilename
        }, true);
    })
}

module.exports = updateFileRef;
