# OpenMapKit Server

OpenMapKit Server is the lightweight NodeJS server component of OpenMapKit that
handles the collection and aggregation of OpenStreetMap and OpenDataKit data.

This software is intended to run both on low-power embedded Linux systems,
as well as on higher powered, cloud-based servers.

OpenMapKit Server is 100% database free! All data is persisted on the file system.

[__deployments__](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/deployments) is the OpenMapKit 
deployment API. This services deployment data in the 
[deployments public directory](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/public/deployments).
Manifest files in this directory work with [posm-deployment](https://github.com/AmericanRedCross/posm-deployment)
to provision deployment data that is fetched by OpenMapKit Android.

[__odk__](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/odk) is the OpenMapKit ODK API. 
This is a REST API that handles all of the ODK business logic, including communicating with ODK Collect,
as well as serving and ingesting ODK XForm data.

[__public__](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/public) is the public directory where 
you store data and static assets. You can set an alternate public directory in `settings.js`. Front-end UI will be built as [micro-apps](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/public/export-osm) that live within directories in the public folder.

[__util__](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/util) has utility functions 
useful to OpenMapKit Server as a whole.


## Installation

Create a `settings.js` file in this directory. You can use `settings.js.example`
as an example.

If you are on Debian or Ubuntu, you may have to install `build-essential`:

```
sudo apt-get install build-essential
```

The ODK component requires python dependencies that are installed via pip.
The best way to install pip on a Mac is through [Homebrew](http://brew.sh/):

```
brew install python
```

On a Debian or Ubuntu machine:

```
sudo apt-get install python-pip
```

Install dependencies, start the server.

```
git submodule init
git submodule update
pip install -r requirements.txt
npm install
npm start
```

We are using node version 4.2.*. If you are having problems with another
version, use [node version manager](https://github.com/creationix/nvm).

```
nvm install
nvm use
```

[![ZenHub] (https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)] (https://zenhub.io)
