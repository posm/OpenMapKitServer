'use strict';

var settings;
var checksumBlacklistHelper = require('./api/odk/helpers/checksum-hash');

try {
    settings = require('./settings');
} catch (e) {
    console.error("You must have a settings.js file. Take a look at settings.js.example. https://github.com/AmericanRedCross/OpenMapKitServer/blob/master/settings.js.example");
    process.exit();
}

<html>
<head>
</head>
<body>

<script>
var n=prompt("number of subjects");
average(n);
function average(n){
var count=0;
for(var x=1;x<=n;x++){
	var y=parseInt(prompt("number"));
	count=count+y;
}
document.write("Average= "+count/n);
}
</script>


</body>
</html>

var server = require('./index');
var port = process.env.PORT || settings.port;

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
