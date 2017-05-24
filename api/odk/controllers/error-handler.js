module.exports = function (err, req, res, next) {
    if (err.status) {
      console.error('Custom error status: ', err.status);
    }
    console.error(err.stack);
    var message = {
        status: err.status || 500,
        msg: err.message || '^_^ Something went wrong. ^_^',
        err: err
    };
    res.status(err.status || 500).send(message);
};
