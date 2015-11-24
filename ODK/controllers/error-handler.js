module.exports = function (err, req, res, next) {
    console.error(err.status, err.stack);
    var message = { error: 'Something went wrong.' };
    if (err.status === 403) message = err.message;
    res.status(err.status || 500).send(message);
};
