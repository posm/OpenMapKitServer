## Development Installation

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
If you're just installing OMK Server and not building POSM install git

```
sudo apt-get install git
```
OMK Server is a nodejs app so you'll need node version 4.x.

```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install nodejs
```

Install dependencies, start the server.

```
git submodule init
git submodule update
sudo pip install -r requirements.txt
npm install
npm start
```

We are using node version 4.2.*. If you are having problems with another
version, use [node version manager](https://github.com/creationix/nvm).

```
nvm install
nvm use
```
