## Development Installation

OpenMapKit Server is a NodeJS service, so you'll need NodeJS version 4.x.

### Ubuntu & Debian

Install dependencies:

```
sudo apt-get install default-jre-headless
sudo apt-get install build-essential python-pip git
curl -sL https://deb.nodesource.com/node_8.x | sudo -E bash -
sudo apt-get install nodejs
```

### Mac

The ODK pyxform component requires python dependencies that are installed via pip.
The best way to install pip on a Mac is through [Homebrew](http://brew.sh/):

```sh
brew install python
```

Make sure you have installed __Java__. `pyxform` has a Java dependency (JavaRosa). Full instructions on [Stack Overflow](http://stackoverflow.com/questions/24342886/how-to-install-java-8-on-mac).

```sh
brew cask install java
```

Also make sure you have installed [NodeJS](https://nodejs.org/) and [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

### Setup Project

Install project dependencies.

```sh
git submodule init
git submodule update
sudo pip install -r requirements.txt
npm install
```

### Turn on server

```sh
npm start
```

If `npm start` is failing, run `npm start --verbose` to see detailed log execution.
You might encounter `Error: Could not locate the bindings file`. Run `npm install libxmljs` to fix this.

### Enable authentication

By default the authentication is enabled in OpenMapKitServer. You can disable it,
by setting the environment variable `DISABLE_AUTH` as `1` or as `true`.

```sh
export DISABLE_AUTH=1
```

### Users and roles

You can edit the [util/users.json](../util/users.json) file to set the users,
passwords and roles. We have two main user roles:

* `dataviewer` - can see the submissions and download submissions data.
* `admin` - have all `dataviewer` permissions and can upload forms and archive/unarchive/delete forms.

Anonymous and other user roles can see the formList, download forms, but does not
have access to submissions.

### Run on development mode

To start the server in the development mode, use `npm startdev`, it will make the React App restart each time the frontend code is updated.

### Updating frontend builds

The frontend builds are ignored by the `master` branch git and available on the `dist` branch. To make a new build and push it to the `dist` branch, use `npm pushbuild`

### Data Sync

If you want to enable AWS S3 sync, in a way to have a backup of forms and
submissions files in a S3 bucket, set the following environment variables:

```sh
export ENABLES3SYNC=1
export AWS_ACCESS_KEY_ID=<your AWS access key ID>
export AWS_SECRET_ACCESS_KEY=<your AWS secret access key>
export AWSBUCKETNAME=<a S3 bucket name>
export AWSBUCKETPREFIX=<(optional, bucket root is the default prefix) subdirectory where the files should be stored in the S3 bucket>
```

This will make the data be syncronized to your S3 bucket after each API request
that modifies the data. The first variable enables/disables the S3
sync and need to receive the value 1 or 0.

If you need to get the data stored in a S3 Bucket to put it in your server,
execute: `npm get_from_s3`.

To assure that the files were synced to AWS before turning off a server, execute
`npm send_to_s3`

### NodeJS Version Problems

We are using node version 4.*. If you are having problems with another
version, use [node version manager](https://github.com/creationix/nvm).

```sh
nvm install
nvm use
```
