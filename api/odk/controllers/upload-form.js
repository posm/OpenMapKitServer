'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const async = require('async');
const mkdirp = require('mkdirp');
const multiparty = require('multiparty');
const mv = require('mv');
const PythonShell = require('python-shell');
const tempy = require('tempy');

const settings = require('../../../settings');
const { syncDataDir } = require('../helpers/aws-sync');
const { getForms, loadXForm } = require('../../../util/xform');

const formsDir = settings.dataDir + '/forms/';

/**
 * Convert an XLSX file to an XForm.
 * Callback will be called with the path of the resulting XForm.
 */
const xlsToXForm = (xlsPath, callback) => {
  var xformPath = tempy.file({
    extension: 'xml'
  });

  return PythonShell.run('xls2xform.py', {
    pythonPath: 'python2',
    scriptPath: path.join(__dirname, '..', 'pyxform', 'pyxform'),
    args: [xlsPath, xformPath],
    mode: 'text'
  }, (err, results) => {
    if (err) {
      return callback(err);
    }

    return callback(null, xformPath);
  });
};

/**
 * User uploads an XLSForm (Excel ODK Form).
 * XLSForms are converted to XForm with pyxform, and both
 * the XLS and XForm files are written to the forms directory.
 *
 * The XLS file should be in the `xls_file` field of the form-data.
 */
module.exports = function (req, res, next) {
  const filesToRemove = [];
  const cleanup = () => filesToRemove
    .filter(x => x != null)
    .forEach(x => fs.unlink(x, () => null));

  const showError = err => {
    cleanup();

    res.status(400).json(err);
  };

  // use async to clean this up
  return new multiparty.Form().parse(req, function (err, fields, files) {
    if (err) {
      return showError({
        status: 400,
        err: err,
        msg: 'Unable to parse input.'
      });
    }

    const uploads = Object.keys(files).map(f => ({
      originalFilename: files[f][0].originalFilename,
      path: files[f][0].path
    }));

    const assets = uploads
      .filter(x => path.extname(x.originalFilename).toLowerCase() !== '.xlsx');

    if (uploads.length === 0) {
      return showError({
        status: 400,
        msg: 'You must POST form-data with at least one file.'
      });
    }

    uploads.forEach(x => filesToRemove.push(x.path));

    const xls = uploads.filter(x => path.extname(x.originalFilename).toLowerCase() === '.xlsx').pop();

    if (xls == null) {
      return showError({
        status: 400,
        msg: 'You must upload an XLSForm.'
      });
    }

    // pyxform defaults to using the filename as its ID if none was otherwise provided, so preserve it (replacing spaces with _s)
    const xlsPath = path.join(os.tmpdir(), xls.originalFilename.replace(' ', '_'));

    return mv(xls.path, xlsPath, err => {
      filesToRemove.push(xlsPath);
      if (err) {
        console.warn(err.stack);
        return showError({
          status: 400,
          err,
          msg: 'Failed to move XLSForm.'
        });
      }

      return xlsToXForm(xlsPath, (err, xformPath) => {
        filesToRemove.push(xformPath);
        if (err) {
          console.warn(err.stack);
          return showError({
            status: 400,
            err,
            msg: 'XLSForm failed to parse.'
          });
        }

        return loadXForm(xformPath, (err, xform) => {
          if (err) {
            console.warn(err.stack);
            return showError({
              status: 400,
              err,
              msg: 'Failed to load XForm.'
            });
          }

          return getForms((err, forms) => {
            if (err) {
              console.warn(err.stack);
              return showError({
                status: 400,
                err,
                msg: 'Failed to list existing XForms.'
              });
            }

            const xlsFilename = xform.id + '.xlsx';
            const targetXlsPath = path.join(formsDir, xlsFilename);
            const xformFilename = xform.id + '.xml';
            const targetXformPath = path.join(formsDir, xformFilename);

            const filenames = forms.map(x => x.filename);
            const ids = forms.map(x => x.id);
            const titles = forms.map(x => x.title);

            if (filenames.indexOf(xformFilename) >= 0) {
              return showError({
                status: 400,
                msg: `A form already exists with that filename (${xformFilename}). Please rename and re-upload.`
              });
            }

            if (ids.indexOf(xform.id) >= 0) {
              return showError({
                status: 400,
                msg: `A form already exists with that ID (${xform.id}). Please change the ID and re-upload.`
              });
            }

            if (titles.indexOf(xform.title) >= 0) {
              return showError({
                status: 400,
                msg: 'A form already exists with that title. Please change the title and re-upload.'
              });
            }

            if (fs.existsSync(targetXformPath)) {
              return showError({
                status: 400,
                msg: `A form already exists with that name (${xformFilename}). Please rename and re-upload.`
              });
            }

            // validate the list of assets against what the form references

            const assetFilenames = assets.map(x => x.originalFilename);

            const extraAssets = assetFilenames
              .filter(x => xform.assets.indexOf(x) < 0);

            const missingAssets = xform.assets
              .filter(x => assetFilenames.indexOf(x) < 0);

            if (missingAssets.length > 0) {
              return showError({
                status: 400,
                msg: `Referenced assets are missing: ${missingAssets.join(', ')}`
              });
            }

            if (extraAssets.length > 0) {
              console.warn(`Ignoring extra assets: ${extraAssets.join(', ')}`);
            }

            const moveOperations = [
              async.apply(mv, xlsPath, targetXlsPath),
              async.apply(mv, xformPath, targetXformPath)
            ];

            if (assets.length > 0) {
              moveOperations.push(async.apply(async.series, [
                async.apply(mkdirp, path.join(formsDir, xform.id)),
                async.apply(async.parallel, assets
                  .filter(x => xform.assets.indexOf(x.originalFilename) >= 0)
                  .map(x => async.apply(mv, x.path, path.join(formsDir, xform.id, x.originalFilename))))
              ]));
            }

            return async.parallel(moveOperations, err => {
              if (err) {
                filesToRemove.push(targetXlsPath);
                filesToRemove.push(targetXformPath);

                return showError({
                  status: 400,
                  err: err,
                  msg: `Unable to move ${xform.title} to the forms directory.`
                });
              } else {
                syncDataDir();
              }

              cleanup();

              return res.status(201).json({
                status: 201,
                msg: `Converted ${xlsFilename} to an XForm and saved everything to the forms directory.`,
                xFormUrl: `${req.protocol}://${req.headers.host}/omk/data/forms/${xformFilename}`,
                xlsFormUrl: `${req.protocol}://${req.headers.host}/omk/data/forms/${xlsFilename}`
              });
            });
          });
        });
      });
    });
  });
};
