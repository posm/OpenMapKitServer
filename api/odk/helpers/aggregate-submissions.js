'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const async = require('async');
const JSONStream = require('JSONStream');
const xpath = require('xml2js-xpath');

const settings = require('../../../settings');
const { getFormMetadata } = require('../../../util/xform');

const ASYNC_LIMIT = 10;

module.exports = (opts, callback) => {
  const { formName, startDate, endDate, deviceId, username } = opts;
  let { offset } = opts;
  let limit = parseInt(opts.limit);

  // default to 100 for limit
  if (isNaN(limit) || limit < 1) {
    limit = 100;
  }

  // check if valid offset. we paginate with valid offset.
  if (offset != null) {
    offset = parseInt(offset);
    if (isNaN(offset) || offset < 0) {
      // TODO pass an Error
      return callback({
        status: 400,
        err: 'BAD_OFFSET',
        msg: 'If you specify an offset for pagination, it must be an integer greater than 0.',
        path: '/odk/submissions/:formName.json'
      });
    }
    // otherwise ok
  }
  // otherwise we don't have an offset

  if (formName == null) {
    // TODO pass an Error
    return callback({
      status: 400,
      err: 'MISSING_PARAM',
      msg: 'You must specify a parameter for the formName in this end point.',
      path: '/odk/submissions/:formName.json'
    });
  }

  return getFormMetadata(formName, (err, meta) => {
    if (err) {
      return callback({
        status: 500,
        msg: 'Could not read form metadata.',
        err
      });
    }

    const selectFields = Object.keys((meta || {}).fields || {})
      .filter(k => meta.fields[k] === 'select');
    const selectItems = selectFields.reduce((obj, k) => {
      obj[k] = xpath.find(meta.form, `//h:body/select[@ref='/${meta.instanceName}/${k}']/item`)
        .reduce((obj2, item) => {
          obj2[item.label[0]] = item.value[0];

          return obj2;
        }, {});

      return obj;
    }, {});

    const dir = settings.dataDir + '/submissions/' + formName;
    const aggregate = [];

    // All of the submission dirs in the form directory
    // Note that fs.readdir is always in alphabetical order on POSIX systems.
    return fs.readdir(dir, (err, submissionDirs) => {
      if (err) {
        if (err.errno === -2) {
          // trying to open a directory that is not there.
          // TODO pass an Error
          return callback({
            status: 404,
            msg: 'You are trying to aggregate the ODK submissions for a form that has no submissions. Please submit at least one survey to see data. Also, check to see if you spelled the form name correctly. Form name: ' + formName,
            err
          });
        }

        // TODO pass an error
        return callback({
          status: 500,
          msg: 'Problem reading submissions directory.',
          err: err
        });
      }

      // if offset, we do pagination
      if (offset != null) {
        submissionDirs = submissionDirs.slice(offset, offset + limit);
      }

      return async.eachLimit(submissionDirs, ASYNC_LIMIT, (submissionDir, next) => {
        // If it's not a directory, we just skip processing that path.
        // TODO use fs.stat() and check for stats.isFile()
        if (submissionDir[0] === '.' || submissionDir.indexOf('.txt') > 0) {
          return next(); // ok, but skipping
        }
        // Otherwise, we want to open up the data.json in the submission dir.
        const dataFile = path.join(dir, submissionDir, 'data.json');
        try {
          const parser = fs.createReadStream(dataFile).pipe(JSONStream.parse());

          parser.on('data', data => {
            const submission = Object.keys(data).reduce((obj, k) => {
              obj[k] = data[k];

              if (meta.fields[k] === 'select') {
                const values = data[k].split(' ');

                Object.keys(selectItems[k]).forEach(itemKey => {
                  obj[`${k}/${selectItems[k][itemKey]}`] = values.indexOf(selectItems[k][itemKey]) >= 0;
                });
              }

              return obj;
            }, {});

            let filtered = true;
            if (startDate && moment(startDate).isAfter(submission.meta.submissionTime)) {
              filtered = false;
            }
            if (endDate && moment(endDate).isBefore(submission.meta.submissionTime)) {
              filtered = false;
            }
            if (deviceId && !submission.deviceid.toString().includes(deviceId)) {
              filtered = false;
            }
            if (username && !submission.username.toString().includes(username)) {
              filtered = false;
            }

            if (filtered) {
              aggregate.push(submission);
            }
            return next(); // ok submission
          });

          parser.on('error', err => next(err));
        } catch (err) {
          // TODO pass an Error
          return next({
            status: 500,
            msg: 'Problem reading data.json file in submission directory. dataFile: ' + dataFile,
            err
          }); // we have an error, break out of all async iteration
        }
      }, err => callback(err, aggregate));
    });
  });
};
