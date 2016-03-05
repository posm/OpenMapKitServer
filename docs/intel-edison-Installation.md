
### Installation for the Intel Edison.
Same as the installtion for the POSM or VM but still super hacky and experiemental. 
It's a 'works on my machine' situation at the moment. 


OpenMapKit Server is a NodeJS service, so you'll need NodeJS version 4.x.
Borrowing heavily from MSF's repo for isntallating Formhub on Edison (https://github.com/ivangayton/ODKAggregateOnEdison/wiki/001-Full-Instructions)

###Ubilinix
Get the Ubilinux distro here:http://www.emutexlabs.com/ubilinux

There is a step by step video walkthrough here: https://www.youtube.com/watch?v=BSnXjuttSgY

I found that the process works best on Windows. I haven't tried on Linux but suspect it'll work fine there as well. Also finding that using screen to ssh into the device after it installing ubilinux is problematic. 

once you ssh in, get the thing connected to the interwebs by chaning the network settings

```
nano /etc/network/interfaces

# interfaces(5) file used by ifup(8) and ifdown(8)
auto lo
iface lo inet loopback

#auto usb0    ---COMMENT OUT THIS LINE
iface usb0 inet static
    address 192.168.2.15
    netmask 255.255.255.0

auto wlan0  --UNCOMMENT OUT THIS LINE
iface wlan0 inet dhcp
    # For WPA
    wpa-ssid YOUR SSID HERE
    wpa-psk YOUR PASSWORD HERE
    # For WEP
    #wireless-essid Emutex
    #wireless-mode Managed
    #wireless-key s:password
# And the following 4 lines are for when using hostapd...
#auto wlan0
#iface wlan0 inet static
#    address 192.168.0.1
#    netmask 255.255.255.0
```

### Those should be the settings to connect to your local network in order to download packages. 


```
reboot

apt-get update
apt-get upgrade -y
apt-get install build-essential python-pip git -y
curl -sL https://deb.nodesource.com/setup_4.x | bash -
apt-get install nodejs -y

```
### Clone the OpenMapKit Server Repo
And get the submodules going

```
git clone https://github.com/AmericanRedCross/OpenMapKitServer

git submodule init
git submodule update
pip install -r requirements.txt
npm install
```

### Need to get OMKserver to start on boot. PM2 seems simple enough for now.
There is probably a 'real' way to do it but this works so lets go for it. 

```
npm install pm2@latest -g

cd OpenMapKitServer
pm2 start server.js
pm2 startup
```

Next time you plug the Edison into a battery navigate to:
 192.168.0.1/omk/info 
 and watch the magic.  
