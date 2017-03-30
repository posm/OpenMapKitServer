'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const async = require('async');
const multiparty = require('multiparty');
const mv = require('mv');
const PythonShell = require('python-shell');
const tempy = require('tempy');
const { parseString } = require('xml2js');

const settings = require('../../../settings');
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

const loadXForm = (xformPath, callback) => {
  return async.waterfall([
    async.apply(fs.readFile, xformPath),
    parseString
  ], (err, obj) => {
    if (err) {
      return callback(err);
    }

    try {
      const key = Object.keys(obj['h:html']['h:head'][0]['model'][0]['instance'][0])[0];

      return callback(null, {
        path: xformPath,
        filename: path.basename(xformPath),
        title: obj['h:html']['h:head'][0]['h:title'][0],
        id: obj['h:html']['h:head'][0]['model'][0]['instance'][0][key][0]['$']['id'],
        form: obj
      });
    } catch (err) {
      return callback(new Error(`Failed while parsing ${xformPath}: ${err.message}`));
    }
  });
};

const getForms = (callback) => {
  return fs.readdir(formsDir, (err, forms) => {
    if (err) {
      return callback(err);
    }

    return async.waterfall([
      async.apply(async.map,
        forms
          .filter(x => x.match(/\.xml$/i))
          .map(x => path.join(formsDir, x)),
        /* eslint handle-callback-err: 0 */
        (filename, callback) =>
          loadXForm(filename, (err, form) =>
            // ignore errors
            callback(null, form))),
      (forms, callback) => callback(null, forms.filter(x => x != null))
    ], callback);
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
  const cleanup = () => filesToRemove.forEach(x => fs.unlink(x, () => null));

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

    if (!Array.isArray(files.xls_file) || files.xls_file.length !== 1) {
      return showError({
        status: 400,
        msg: 'You must POST form-data with a key of "xls_file" and a value of an XLSX Excel file.'
      });
    }

    // pyxform defaults to using the filename as its ID if none was otherwise provided, so preserve it (replacing spaces with _s)
    const xlsPath = path.join(os.tmpdir(), files.xls_file[0].originalFilename.replace(' ', '_'));
    filesToRemove.push(files.xls_file[0].path);

    return mv(files.xls_file[0].path, xlsPath, err => {
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

            const xlsFilename = path.basename(xlsPath);
            const targetXlsPath = path.join(formsDir, xlsFilename);
            const xformFilename = path.basename(xlsPath, path.extname(xlsPath)) + '.xml';
            const targetXformPath = path.join(formsDir, xformFilename);

            const filenames = forms.map(x => x.filename);
            const ids = forms.map(x => x.id);
            const titles = forms.map(x => x.title);

            if (filenames.indexOf(xformFilename) >= 0) {
              return showError({
                status: 400,
                msg: 'A form already exists with that filename. Please rename and re-upload.'
              });
            }

            if (ids.indexOf(xform.id) >= 0) {
              return showError({
                status: 400,
                msg: 'A form already exists with that ID. Please change the ID and re-upload.'
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
                msg: 'A form already exists with that name. Please rename and re-upload.'
              });
            }

            return async.parallel([
              async.apply(mv, xlsPath, targetXlsPath),
              async.apply(mv, xformPath, targetXformPath)
            ], err => {
              if (err) {
                filesToRemove.push(targetXlsPath);
                filesToRemove.push(targetXformPath);

                return showError({
                  status: 400,
                  err: err,
                  msg: `Unable to move ${xform.title} to the forms directory.`
                });
              }

              cleanup();

              return res.status(201).json({
                status: 201,
                msg: `Converted ${xlsFilename} to an XForm and saved both to the forms directory.`,
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
