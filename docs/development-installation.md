## Development Installation

OpenMapKit Server is a NodeJS service, so you'll need NodeJS version 4.x.

### Ubuntu & Debian

Install dependencies:

```
sudo apt-get install build-essential python-pip git
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install nodejs
```

### Mac

The ODK pyxform component requires python dependencies that are installed via pip.
The best way to install pip on a Mac is through [Homebrew](http://brew.sh/):

```
brew install python
```

Also make sure you have installed [NodeJS](https://nodejs.org/) and [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

### Setup Project

Install project dependencies.

```
git submodule init
git submodule update
sudo pip install -r requirements.txt
npm install
```

### Turn on server

```
npm start
```

### NodeJS Version Problems

We are using node version 4.*. If you are having problems with another
version, use [node version manager](https://github.com/creationix/nvm).

```
nvm install
nvm use
```
