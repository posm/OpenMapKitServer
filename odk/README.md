# OpenMapKit ODK API

The OpenMapKit ODK API is a NodeJS REST API that handles all of the ODK
business logic, including communicating with ODK Collect as well as
serving and ingesting ODK XForm data.

This API persists data either in SQLite or directly on the filesystem.

This API is inspired from and directly uses some of [SimpleODK](https://github.com/digidem/simple-odk)
as well as several assocaited node modules.
