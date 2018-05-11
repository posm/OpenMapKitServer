## Development Installation

OpenMapKit Server is a NodeJS service, so you'll need NodeJS version 4.x.

### Ubuntu & Debian

Install dependencies:

```
sudo apt-get install default-jre-headless
sudo apt-get install build-essential python-pip git
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
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
If you want to enable AWS S3 sync, in a way to have a backup of forms and
submissions files in a S3 bucket, set the following environment variables:

```sh
export ENABLES3SYNC=1
export AWSKEYID=<your AWS access key ID>
export AWSSECRETKEY=<your AWS secret access key>
export AWSBUCKETNAME=<a S3 bucket name>
```

With the first variable you can enable/disable the S3 sync using the values 1/0.

### Turn on server

```sh
npm start
```

If `npm start` is failing, run `npm start --verbose` to see detailed log execution.
You might encounter `Error: Could not locate the bindings file`. Run `npm install libxmljs` to fix this.

### NodeJS Version Problems

We are using node version 4.*. If you are having problems with another
version, use [node version manager](https://github.com/creationix/nvm).

```sh
nvm install
nvm use
```
