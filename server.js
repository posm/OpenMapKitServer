'use strict';

var settings;
const checksumBlacklistHelper = require('./odk/helpers/checksum-hash');

try {
    settings = require('./settings');
} catch (e) {
    console.error("You must have a settings.js file. Take a look at settings.js.example. https://github.com/AmericanRedCross/OpenMapKitServer/blob/master/settings.js.example");
    process.exit();
}

var server = require('./index');
const port = process.env.PORT || settings.port;


// Build checksum blacklists for each form, then start the API
checksumBlacklistHelper.create(function(err){

    if(err) {
        console.error(err);
        return;
    }

    server.listen(port, function () {
        console.log('OpenMapKit Server is listening on port %s.', port);
    });
});
