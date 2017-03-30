'use strict';

const path = require('path');

const archiver = require('archiver');
const recursive = require('recursive-readdir');

const settings = require('../../../settings');

/**
 * Aggregates together all attachments to survey submissions.
 */
module.exports = (req, res, next) => {
  const formName = req.params.formName;
  const submissionsDir = path.join(settings.dataDir, 'submissions', formName);

  return recursive(submissionsDir, (err, files) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        msg: 'Could not list submissions.',
        err: err
      });
    }

    res.status(200);
    // res.contentType('application/zip');
    res.contentType('application/zip');
    res.set('Content-Disposition', `attachment; filename=${formName}.zip`);

    const archive = archiver('zip');

    archive.on('close', () => {
      res.end();
    });

    archive.on('error', err => {
      console.warn(err.stack);
    });

    archive.pipe(res);

    files
      // ignore OSM files
      .filter(filename => path.extname(filename) !== '.osm')
      // ignore XForm responses
      .filter(filename => ['data.json', 'data.xml'].indexOf(path.basename(filename)) < 0)
      .forEach(filename => {
        archive.file(filename, {
          name: path.basename(filename)
        });
      });

    archive.finalize();
  });
};
