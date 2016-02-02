'use strict';

var settings;

try {
    settings = require('./settings');
} catch (e) {
    console.error("You must have a settings.js file. Take a look at settings.js.example. https://github.com/AmericanRedCross/OpenMapKitServer/blob/master/settings.js.example");
    process.exit();
}

const express = require('express');
const bodyParser = require('body-parser');
const directory = require('serve-index');
const cors = require('cors');
const odk = require('./odk/odk-routes');
const deployments = require('./deployments/deployment-routes');
const error = require('./odk/controllers/error-handler');
const pkg = require('./package');
const app = express();

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
app.use('/public', express.static(settings.publicDir));
app.use('/public', directory(settings.publicDir));

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
