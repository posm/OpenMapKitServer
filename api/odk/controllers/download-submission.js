"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const async = require("async");
const builder = require("xmlbuilder");

const settings = require("../../../settings");

const SUBMISSIONS_DIR = path.join(settings.dataDir, "submissions");

module.exports = (req, res, next) => {
  const formId = req.query.formId.split("[@version").shift();
  const instanceId = req.query.formId
    .split("[@key=")
    .pop()
    .split("]")
    .shift()
    .split("uuid:")
    .pop();
  const instancePath = path.join(SUBMISSIONS_DIR, formId, instanceId);

  return fs.access(instancePath, err => {
    if (err) {
      return res.sendStatus(404);
    }

    return fs.readdir(instancePath, (err, files) => {
      if (err) {
        return next(err);
      }

      res.contentType("application/xml");

      const xml = builder
        .begin(
          {
            writer: {
              pretty: true
            }
          },
          chunk => res.write(chunk)
        )
        .ele("submission")
        .att({
          xmlns: "http://opendatakit.org/submissions"
        });

      return fs.readFile(
        path.join(instancePath, "data.xml"),
        "utf-8",
        (err, body) => {
          if (err) {
            return next(err);
          }

          // NOTE we don't need no stinking XML parsers
          xml
            .ele("data")
            .raw(
              body.replace(/^\<data/, `<data instanceID="uuid:${instanceId}"`)
            )
            .up();

          const mediaFiles = files.filter(
            x => !["data.json", "data.xml"].includes(x)
          );

          async.each(
            mediaFiles,
            (file, done) => {
              return fs.readFile(path.join(instancePath, file), (err, data) => {
                if (err) {
                  return done(err);
                }

                const hash = crypto
                  .createHash("md5")
                  .update(data)
                  .digest("hex");
                const downloadUrl = `${req.protocol}://${req.headers.host}/omk/data/submissions/${formId}/${instanceId}/${file}`;

                xml
                  .ele("mediaFile")
                  .ele("fileName", file)
                  .up()
                  .ele("hash", `md5:${hash}`)
                  .up()
                  .ele("downloadUrl", downloadUrl)
                  .up()
                  .up();

                return done();
              });
            },
            err => {
              if (err) {
                return next(err);
              }

              return res.send(xml.end());
            }
          );
        }
      );
    });
  });
};
