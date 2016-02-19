'use strict';

var settings;

try {
    settings = require('./settings');
} catch (e) {
    console.error("You must have a settings.js file. Take a look at settings.js.example. https://github.com/AmericanRedCross/OpenMapKitServer/blob/master/settings.js.example");
    process.exit();
}

var express = require('express');
var bodyParser = require('body-parser');
var directory = require('serve-index');
var cors = require('cors');
var odk = require('./api/odk/odk-routes');
var deployments = require('./api/deployments/deployment-routes');
var error = require('./api/odk/controllers/error-handler');
var pkg = require('./package');
var app = express();

// Enable CORS always.
app.use(cors());

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Basic Info
app.get('/', info);
app.get('/info', info);

// Open Data Kit
//
// It's better to stay on top level of routes to
// prevent the user from having to add a prefix in ODK Collect
// server path.
app.use('/', odk);

// Deployments
app.use('/deployments', deployments);

// Public Data & Static Assets
app.use('/public', express.static(settings.dataDir));
app.use('/public', directory(settings.dataDir));
app.use('/pages', express.static(settings.pagesDir));
app.use('/pages', directory(settings.pagesDir));

// Handle errors
app.use(error);

module.exports = app;

function info(req, res) {
    res.status(200).json({
        name: settings.name,
        description: settings.description,
        status: 200,
        service: pkg.name,
        version: pkg.version
    });
}
