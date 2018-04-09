var fs = require('fs');
var path = require('path');
var settings = require('../../../settings.js');

module.exports = (req, res, next) => {
  const formName = req.params.formName;
  const xlsFile = path.join(settings.dataDir, 'forms', `${formName}.xls`);
  const xlsxFile = path.join(settings.dataDir, 'forms', `${formName}.xlsx`);
  const xmlFile = path.join(settings.dataDir, 'forms', `${formName}.xml`);
  const submissionDir = path.join(settings.dataDir, 'submissions', formName);
  let errors = [];

  fs.readdir(submissionDir, (err, items) => {
    if (!err && items.length > 0) {
      return res.status(403).json(
        {detail: "This form can not be deleted because it has submissions"}
      );
    } else {
      if (!err) {
        fs.rmdir(submissionDir);
      }
    }
    if (err) {
      [xlsFile, xlsxFile, xmlFile].map(file => {
        fs.stat(file, (statError, stats) => {
          if (statError) {
            errors.push(file)
          } else {
            fs.unlink(file, unlinkError => {
              if (unlinkError) errors.push(file);
            });
          }
        }
        );
      });

      if (errors.length > 1) {
        res.status(404).json(
          {detail: "It was not possible to find or delete the form files"}
        );
      } else {
        res.status(200).json({detail: "Form deleted successfully"});
      }
    }
  }
  );
};
