# POSM Build Installation

For an actual deployment of OpenMapKit Server, it is recommended to use 
[posm-build](https://github.com/AmericanRedCross/posm-build) to install your
instance. posm-build is a lightweight shell build system used for POSM servers. 
OpenMapKit Server is designed to be a part of a POSM server, however, the 
posm-build allows you to be modular regarding what gets installed, so you can
and should use it if you want to install a standalone OpenMapKit Server.

The advantage is that in a few lines, you can have OpenMapKit Server installed
and integrated as an Upstart service in Ubuntu Linux. This means that if
OpenMapKit Server crashes or is restarted, the API will restart automatically.
Also, posm-build only gets the dependencies you need and downloads only the 
files you need, so the entire repo does not need to be cloned with git.

## Tested On

* Amazon EC2 Ubuntu Server 14.04 LTS
	- Instance Type: t2.nano
	- vCPUs: 1
	- Memory: 500 MB
	- Storage: 8 GB
	- Open Ports: 22, 80, 3210

OpenMapKit Server is intended to be as light-weight as possible, so you don't
have to throw much hardware at it.

## Steps

1. Download and extract posm-build.

```
sudo -s
wget -q -O - https://github.com/AmericanRedCross/posm-build/archive/master.tar.gz | tar -zxf - -C /root --strip=2
```

2. Create a `settings.local` file in `/root/etc` with the following content:

```
posm_domain="local"
posm_hostname="posm.$posm_domain"
posm_ip="54.191.109.128"
```

Replace the IP address for `posm_ip` with the actual public IP or your server.

3. Execute `bootstrap.sh` and tell it to only install NGINX and OpenMapKit Server.

```
/root/scripts/bootstrap.sh base virt nodejs nginx omk
```

Let the installation churn. That's it!
