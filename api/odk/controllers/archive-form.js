var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

const { syncDataDir } = require('../helpers/aws-sync');
var settings = require('../../../settings.js');


const moveFiles = (archiveDir, formName) => {
  // move forms files to archive/forms/ dir
  fs.readdir(path.join(settings.dataDir, 'forms'), (err, items) => {
    items.filter(
      i => [`${formName}.xls`, `${formName}.xlsx`, `${formName}.xml`].includes(i)
    ).forEach(
      i => fse.move(
        path.join(settings.dataDir, 'forms', i),
        path.join(archiveDir, 'forms', i),
        renameError => {
          if (renameError) {
            console.log(`Error when moving file ${i}.`);
          } else {
            syncDataDir('forms');
            syncDataDir('archive/forms');
          };
        }
      )
    );
  });
}


module.exports = (req, res, next) => {
  const formName = req.params.formName;
  const submissionDir = path.join(settings.dataDir, 'submissions', formName);
  const archiveDir = path.join(settings.dataDir, 'archive');

  // check and create archive dir and its subdirectories
  fs.readdir(archiveDir, (err, items) => {
    if (err) {
      fs.mkdir(archiveDir, mkdirError => {
        if (mkdirError) {
          return res.status(500).json({detail: "It wasn't possible to create archive dir."});
        } else {
          fs.mkdir(path.join(archiveDir, 'forms'), formsDirError => {
            if (!formsDirError) moveFiles(archiveDir, formName);
          });
          return res.status(200).json({detail: "Form archived successfully."});
        }
      });
    } else {
      if (items.filter(i => i === 'forms').length === 0) {
        fs.mkdir(path.join(archiveDir, 'forms'), (err) => {
            if (!err) {
              moveFiles(archiveDir, formName)
            } else {
              return res.status(500).json(
                {detail: "It wasn't possible to create forms archive dir."}
              );
            }
          }
        );
      } else {
        moveFiles(archiveDir, formName);
      }
      return res.status(200).json({detail: "Form archived successfully."});
    }
  });
};
