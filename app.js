const express = require('express');
const directory = require('serve-index');

const settings = require('./settings');

const fs = require('./ODK/routes/fs');
const error = require('./ODK/controllers/error-handler');

const app = express();

app.get('/', function (req, res) {
    res.status(200).json({
        name: settings.name,
        description: settings.description,
        status: 200
    });
});

app.use('/public', express.static(settings.publicDir));
app.use('/public', directory(settings.publicDir));

// Public File System Endpoint
app.use('/fs', fs);

// Handle errors
app.use(error);

app.listen(settings.port);
console.log('OpenMapKit Server listening on port %s', settings.port);
