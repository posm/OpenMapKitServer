'use strict';

const createManifest = require('openrosa-manifest');

const { getFormMetadata } = require('../../../util/xform');

module.exports = (req, res, next) => {
  const formId = req.params.formName;

  return getFormMetadata(formId, (err, meta) => {
    if (err) {
      console.warn(err.stack);
      return res.status(500).json({
        err: err.message
      });
    }

    const files = meta.assets.map(x => ({
      filename: x,
      url: `${req.protocol}://${req.headers.host}/omk/data/forms/${formId}/${x}`
    }));

    return createManifest(files, (err, xml) => {
      if (err) {
        console.warn(err.stack);
        return res.status(500).json({
          err: err.message
        });
      }

      res.contentType('text/xml; charset=utf-8');
      res.setHeader('X-OpenRosa-Version', '1.0');
      return res.status(200).send(xml);
    });
  });
};
