var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

const { syncDataDir } = require('../helpers/aws-sync');
var settings = require('../../../settings.js');


module.exports = (req, res, next) => {
  const formName = req.params.formName;
  const submissionDir = path.join(settings.dataDir, 'submissions', formName);
  const archiveDir = path.join(settings.dataDir, 'archive');
  let movedFiles = [];

  // check if there is already an active form with the same name
  fs.readdir(path.join(settings.dataDir, 'forms'), (err, items) => {
    const filtered = items.filter(
      i => [`${formName}.xls`, `${formName}.xlsx`, `${formName}.xml`].includes(i)
    );
    if (filtered.length > 0) {
      console.log('entrou');
      return res.status(403).json({detail: "There is already an active form with this name"});
    } else {
      fs.readdir(path.join(archiveDir, 'forms'), (err, items) => {
        items.filter(
          i => [`${formName}.xls`, `${formName}.xlsx`, `${formName}.xml`].includes(i)
        ).forEach(
          // move forms dir
          i => fse.move(
            path.join(archiveDir, 'forms', i),
            path.join(settings.dataDir, 'forms', i),
            renameFormError => {
              if (renameFormError) {
                return res.status(500).json(
                  {detail: "Something went wrong during the restoration process."}
                );
              } else {
                console.log(path.join(settings.dataDir, 'archive/forms'));
                syncDataDir('forms');
                syncDataDir('archive/forms');
              }
            }
          )
        );
      });
      return res.status(200).json({detail: "Form restored successfully."});
    }
  });
};
