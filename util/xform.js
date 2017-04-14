'use strict';

const fs = require('fs');
const path = require('path');

const async = require('async');
const { parseString } = require('xml2js');
const xpath = require('xml2js-xpath');

const settings = require('../settings');

const FORMS_DIR = path.join(settings.dataDir, 'forms/');

const loadXForm = (xformPath, callback) => {
  return async.waterfall([
    async.apply(fs.readFile, xformPath),
    parseString
  ], (err, form) => {
    if (err) {
      return callback(err);
    }

    try {
      const instanceName = Object.keys(xpath.evalFirst(form, '//h:head/model/instance'))[0];
      const fieldNames = Object
        .keys(xpath.evalFirst(form, `//model/instance/${instanceName}`))
        .filter(x => x !== '$');

      const fields = fieldNames.reduce((obj, k) => {
        const node = xpath.evalFirst(form, `//model/bind[@nodeset='/${instanceName}/${k}']`);

        if (node != null) {
          obj[k] = node.$.type;
        }

        return obj;
      }, {});

      let assets = [];
      try {
        assets = xpath
          .find(form, '//h:head/model/itext/translation/text/value')
          .map(x => x._)
          .filter(x => x != null)
          .filter(x => x.match(/jr:\/\/(images|audio|video)/i))
          .map(x => x.replace(/jr:\/\/(images|audio|video)\//i, ''));
      } catch (err) {
        // noop
      }

      return callback(null, {
        assets,
        path: xformPath,
        fields,
        filename: path.basename(xformPath),
        form,
        id: xpath.evalFirst(form, '//model/instance/@id').$.id,
        instanceName,
        title: xpath.evalFirst(form, '//h:title')
      });
    } catch (err) {
      return callback(new Error(`Failed while parsing ${xformPath}: ${err.message}`));
    }
  });
};

const getForms = (callback) => {
  return fs.readdir(FORMS_DIR, (err, forms) => {
    if (err) {
      return callback(err);
    }

    return async.waterfall([
      async.apply(async.map,
        forms
          .filter(x => x.match(/\.xml$/i))
          .map(x => path.join(FORMS_DIR, x)),
        /* eslint handle-callback-err: 0 */
        (filename, callback) =>
          loadXForm(filename, (err, form) =>
            // ignore errors
            callback(null, form))),
      (forms, callback) => callback(null, forms.filter(x => x != null))
    ], callback);
  });
};

const getFormMetadata = (formName, callback) => {
  return getForms((err, forms) => {
    if (err) {
      return callback(err);
    }

    const meta = forms.filter(x => x.id === formName).pop();

    return callback(null, meta);
  });
};

module.exports = {
  getFormMetadata,
  getForms,
  loadXForm
};
