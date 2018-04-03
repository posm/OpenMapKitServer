var fs = require('fs');
var path = require('path');
var settings = require('../../../settings.js');


const moveFiles = (archiveDir, formName) => {
  // move forms file to archive
  fs.readdir(path.join(settings.dataDir, 'forms'), (err, items) => {
    items.filter(
      i => [`${formName}.xls`, `${formName}.xlsx`, `${formName}.xml`].includes(i)
    ).forEach(
      i => fs.rename(
        path.join(settings.dataDir, 'forms', i),
        path.join(archiveDir, 'forms', i),
        renameError => {
          if (renameError) errors.push(i);
        }
      )
    );
  });
}


const moveSubmissions = (submissionDir, archiveDir, formName) => {
  // move submissions dir to archive
  fs.rename(
    submissionDir,
    path.join(archiveDir, 'submissions', formName),
    renameError => console.log('It was not possible to move the submissions directory.')
  );
}


module.exports = (req, res, next) => {
  const formName = req.params.formName;
  const submissionDir = path.join(settings.dataDir, 'submissions', formName);
  const archiveDir = path.join(settings.dataDir, 'archive');
  let errors = [];

  // check and create archive dir and its subdirectories
  fs.readdir(archiveDir, (err, items) => {
    if (err) {
      fs.mkdir(archiveDir, mkdirError => {
        if (mkdirError) {
          return res.status(500).json({detail: "It wasn't possible to create archive dir."})
        } else {
          fs.mkdir(path.join(archiveDir, 'forms'), mkdirError => {
            if (!mkdirError) moveFiles(archiveDir, formName);
          });
          fs.mkdir(path.join(archiveDir, 'submissions'), mkdirError => {
            if (!mkdirError) moveSubmissions(submissionDir, archiveDir, formName);
          });
        }
      });
    } else {
      if (items.filter(i => i === 'forms').length === 0) {
        fs.mkdir(path.join(archiveDir, 'forms'));
      } else {
        moveFiles(archiveDir, formName);
      }
      if (items.filter(i => i === 'submissions').length === 0) {
        fs.mkdir(path.join(archiveDir, 'submissions'));
      } else {
        moveSubmissions(submissionDir, archiveDir, formName);
      }
    }
  });



  if (errors.length > 1) {
    res.status(500).json({detail: "Errors ocurred during the archive process."})
  } else {
    res.status(200).json({detail: "Form archived successfully."})
  }
};
