var usersDB = require('./users.json');

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (usersDB[idx]) {
      cb(null, usersDB[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
};

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = usersDB.length; i < len; i++) {
      var record = usersDB[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
};
