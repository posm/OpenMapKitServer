# OpenMapKit Server

OpenMapKit Server is the lightweight NodeJS server component of OpenMapKit that
handles the collection and aggregation of OpenStreetMap and OpenDataKit data.

This software is intended to run both on low-power embedded Linux systems,
as well as on higher powered, cloud-based servers.

OpenMapKit Server is 100% database free! All data is persisted on the file system.

## [Development Installation](docs/development-installation.md)

These [instructions](tree/master/docs/development-installation.md) are for setting up 
and running OpenMapKit Server in your development environment.

## [Production Installation](docs/posm-build-installation.md)

If you want to run OpenMapKit Server for your field mapping survey, use the 
[POSM Build Installation](docs/posm-build-installation.md) instructions.


## Project Structure

[__deployments__](deployments) is the OpenMapKit 
deployment API. This services deployment data in the 
[deployments public directory](public/deployments).
Manifest files in this directory work with [posm-deployment](https://github.com/AmericanRedCross/posm-deployment)
to provision deployment data that is fetched by OpenMapKit Android.

[__odk__](odk) is the OpenMapKit ODK API. 
This is a REST API that handles all of the ODK business logic, including communicating with ODK Collect,
as well as serving and ingesting ODK XForm data.

[__public__](public) is the public directory where 
you store data and static assets. You can set an alternate public directory in `settings.js`. Front-end UI will be built as [micro-apps](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/public/export-osm) that live within directories in the public folder.

[__util__](util) has utility functions 
useful to OpenMapKit Server as a whole.


## The Basics

### After your installation is done, you can see if the server is alive at:

http://<your_ip>/info

### See all of the data and apps on your server:

http://<your_ip>/public/

### Upload an XLS Form:

http://<your_ip>/public/upload-form/

### Edit your OSM submissions and finalize to OpenStreetMap:

http://<your_ip>/public/id/

You need to submit some data first to see something. Pick which form you 
want in the top right (once you've submitted some data).

Download your aggregated OSM XML by selecting your form and pressing 
__Download__ in the top right.

### See your ODK submissions:

http://<your_ip>/submissions/<form>.json

### See your OSM submissions:

This is where you can see what OpenMapKit Android users submitted to 
OpenMapKit Server.

http://<your_ip>/submissions/<form>.osm

To filter your OSM submissions by user, do the following:

http://<your_ip>/submissions/<form>.osm?user=<osm_user>

To filter by date:

http://<your_ip>/submissions/<form>.osm?submitTimeStart=2015-12-28

or

http://<your_ip>/submissions/<form>.osm?submitTimeStart=2015-12-28&submitTimeEnd=2015-12-30

A UI for filtering in iD is coming soon...


[![ZenHub] (https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)] (https://zenhub.io)
