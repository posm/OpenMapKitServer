# OpenMapKit ODK API

The OpenMapKit ODK API is a NodeJS REST API that handles all of the ODK
business logic, including communicating with ODK Collect as well as
serving and ingesting ODK XForm data.

This API persists data [directly on the filesystem](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/public).

This API is inspired from and directly uses some of [SimpleODK](https://github.com/digidem/simple-odk)
as well as several assocaited node modules.

[pyxform](https://github.com/spatialdev/pyxform) is installed in this directory. This python tool is used to 
convert XLS Forms into XForm XML - the format understood by ODK Collect. The SpatialDev fork is used in a submodule
which fixes a bug preventing it from working on OS X.
