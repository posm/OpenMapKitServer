'use strict';

var settings;

try {
    settings = require('./settings');
} catch (e) {
    console.error("You must have a settings.js file. Take a look at settings.js.example. https://github.com/AmericanRedCross/OpenMapKitServer/blob/master/settings.js.example");
    process.exit();
}

var server = require('./server');
const port = process.env.PORT || settings.port;

server.listen(port, function () {
    console.log('OpenMapKit Server is listening on port %s.', port);
});