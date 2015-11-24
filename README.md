# OpenMapKit Server

 OpenMapKit Server is the lightweight server component of OpenMapKit that
 handles the collection and aggregation of OpenStreetMap and OpenDataKit data.

 This software is intended to run both on low-power embedded Linux systems,
 as well as on higher powered, cloud-based servers.

 __OSMSpatialite__ handles ingestion of OSM data and is ultimately responsible
 for creating changesets that can be submitted to the primary OSM 0.6 Editing
 API.

 __ODK__ is the OpenMapKit ODK API. This is a NodeJS REST API that handles
 all of the ODK business logic, including communicating with ODK Collect,
 as well as serving and ingesting ODK XForm data.

## Installation

Create a `settings.js` file in this directory. You can use `settings.js.example`
as an example.

Install dependencies, start the server.

```
npm install
npm start
```

We are using node version 4.2.*. If you are having problems with another
version, use [node version manager](https://github.com/creationix/nvm).

```
nvm install
nvm use
```
