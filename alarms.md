# Alarms

## Server crashes: Accessing the website returns a `504 Gateway Timeout` or `502 Bad Gateway`

This means that the request was routed to an unhealthy instance behind the OpenMapKitServer load balancer, or that there are no healthy instances behind the OpenMapKitServer load balancer. In order to fix this issue:

* Log onto the EC2 console. Find `Target Groups` from the left panel.
* Search using the full OMK stack name as a search string. For example: `OpenMapKitServer-tanzania` (Not `tanzania`). Select the target group that shows up in the search results.
* Select the `Targets` tab. At least one target must be unhealthy. Navigate to the EC2 console of the unhealthy target by clicking on the instance ID.
* SSH into the EC2 instance by using its public DNS and its key file: `ssh -i ../<path-to-keyfile> ubuntu@<Public DNS>`
* `sudo su`
* Run `lsof -i:3210`. If this shows a result, the server should become healthy, and no further actions are required. If it doesn't show a result:
  * Check if there is a file called `screenlog.0` in `/home/ubuntu`. If yes, open this file, and check the last few lines. `tail -n 100 /home/ubuntu/screenlog.0 | less`.
  * If this file does not exist, check the last few lines on `/var/log/cloud-init-output.log`, by running: `tail -n 100 /var/log/cloud-init-output.log | less`. Note down the last request that may have caused the server to crash on https://github.com/hotosm/OpenMapKitServer/issues/108. There are a few examples of such requests on that ticket, if you need help identifying a faulty request.

To resolve:
  * `screen -S restart`
  * `cd /`
  * `sh /var/log/cloud/instances/<instance-ID>/user-data.txt`
  * Run `Ctrl + a`, and then press `H`. This creates a new logfile for the application.
  * Run `Ctrl + a` and press `d` to exit the application.

Check the target group again to see if the instance has become healthy.
