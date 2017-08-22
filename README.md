# OpenMapKit Server

OpenMapKit Server is the lightweight NodeJS server component of OpenMapKit that
handles the collection and aggregation of OpenStreetMap and OpenDataKit data.

This software is intended to run both on low-power embedded Linux systems,
as well as on higher powered, cloud-based servers.

OpenMapKit Server is 100% database free! All data is persisted on the file system.

## [Development Installation](docs/development-installation.md)

These [instructions](docs/development-installation.md) are for setting up 
and running OpenMapKit Server in your development environment.

## [Production Installation](docs/posm-build-installation.md)

If you want to run OpenMapKit Server for your field mapping survey, use the 
[POSM Build Installation](docs/posm-build-installation.md) instructions and [POSM documentation](http://posm.io/).


## Project Structure

[__deployments__](deployments) is the OpenMapKit 
deployment API. This services deployment data in the 
[deployments data directory](data/deployments).
Manifest files in this directory are read by OpenMapKit Android as metadata regarding the deployment
data provided. Deployments are created by [posm-admin](https://github.com/AmericanRedCross/posm-admin).
to provision deployment data that is fetched by OpenMapKit Android.

[__odk__](odk) is the OpenMapKit ODK API. 
This is a REST API that handles all of the ODK business logic, including communicating with ODK Collect,
as well as serving and ingesting ODK XForm data.

[__jekyll__](jekyll) is where the front end pages live.

[__pages__](pages) is where the Jekyll project is built. The pages are served from here.

[__data__](data) is where all of the data is stored on the server's file system.

[__util__](util) has utility functions 
useful to OpenMapKit Server as a whole.


## The Basics

#### After your installation is done, you can see if the server is alive at:

    http://{{your_host_url}}/info

#### To get forms and send submissions in ODK Collect set:

__ODK Collect__ > __General Settings__ > __Configure platform settings__ > __URL__

    http://{{your_host_url}}

#### See all of the pages on your server:

    http://{{your_host_url}}/pages/

#### Upload an XLS Form:

    http://{{your_host_url}}/pages/upload-form/


## API

Check out the [API Documentation](docs/api.md) for details about the REST API.

[![ZenHub](https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)](https://zenhub.io)


## Miscellany

### Testing XML Submissions

```bash
curl -F xml_submission_file=@problematic.xml http://localhost:3210/submission
```
