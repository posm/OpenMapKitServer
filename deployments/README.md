# OpenMapKit Deployments API

This API simply serves deployment data to [OpenMapKit Android](https://github.com/AmericanRedCross/OpenMapKitAndroid).
It provides a list of deployments available in the [public deployments directory](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/public/deployments).
This includes a list of files in a given Deployment area of interest as well as the manifest file.

`<server_url>/deployments` provides the list of all of the deployments available, including their files and manifests.

`<server_url>/deployments/:deployment` provides the files and manifest for a given deployment. The `:deployment` GET
parameter is the name of the [deployment directory](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/public/deployments/Arcade%20Creek)
in the deployments public directory.
