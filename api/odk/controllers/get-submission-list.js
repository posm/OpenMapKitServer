"use strict";

const fs = require("fs");
const path = require("path");

const builder = require("xmlbuilder");

const settings = require("../../../settings");

const SUBMISSIONS_DIR = path.join(settings.dataDir, "submissions");

module.exports = (req, res, next) => {
  const formPath = path.join(SUBMISSIONS_DIR, req.query.formId);

  return fs.access(formPath, err => {
    if (err) {
      return res.sendStatus(404);
    }

    return fs.readdir(
      path.join(SUBMISSIONS_DIR, req.query.formId),
      (err, files) => {
        if (err) {
          return next(err);
        }

        const offset = req.query.cursor | 0;
        const count = (req.query.numEntries || 100) | 0;

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
          .ele("idChunk")
          .att({
            xmlns: "http://opendatakit.org/submissions"
          })
          .ele("idList");

        files
          .slice(offset, count)
          .forEach(uuid => xml.ele("id", `uuid:${uuid}`).up());

        let resumptionCursor = req.query.cursor || null;
        if (files.length > offset + count) {
          resumptionCursor = offset + count;
        }

        xml.up().ele("resumptionCursor", resumptionCursor);

        return res.send(xml.end());
      }
    );
  });
};
