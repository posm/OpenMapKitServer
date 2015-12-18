module.exports = function (err, req, res, next) {
    console.error(err.status, err.stack);
    var message = {
        status: err.status || 500,
        msg: '^_^ Something went wrong. ^_^',
        err: err
    };
    res.status(err.status || 500).send(message);
};
