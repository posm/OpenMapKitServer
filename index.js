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
var odkOpenRosa = require('./api/odk/odk-openrosa-routes');
var odkAggregate = require('./api/odk/odk-aggregate-routes');
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
app.get('/omk', info);
app.get('/omk/info', info);

// Open Data Kit OpenRosa

// It's better to stay on top level of routes to
// prevent the user from having to add a prefix in ODK Collect
// server path.
app.use('/', odkOpenRosa);

// Open Data Kit Aggregate

// These are endpoints that are used by iD and other pages.
// They are used to aggregate ODK and OSM data, and they
// do not need to be OpenRosa spec'ed like the endpoints
// interacted with in ODK Collect.
app.use('/omk/odk', odkAggregate);

// Deployments
app.use('/omk/deployments', deployments);

// Public Data & Static Assets
app.use('/omk/data', express.static(settings.dataDir));
app.use('/omk/data', directory(settings.dataDir));
app.use('/omk/pages', express.static(settings.pagesDir));
app.use('/omk/pages', directory(settings.pagesDir));

// Handle errors
app.use(error);

module.exports = app;

function info(req, res) {
    res.status(200).json({
        name: settings.name,
        description: settings.description,
        status: 200,
        service: 'omk-server',
        npm: pkg.name,
        version: pkg.version
    });
}
