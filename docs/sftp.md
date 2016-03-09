# Uploading data to OpenMapKit Server via SFTP

You can upload data to OpenMapKit Server by SFTP or SCP. For those of you
who like GUIs, I recommend [CyberDuck](https://cyberduck.io).

For OpenMapKit Servers deployed with [posm-build](https://github.com/AmericanRedCross/posm-build),
the following are the directories you can access data:

Forms: `/opt/omk/OpenMapKitServer/data/forms`

Submissions: `/opt/omk/OpenMapKitServer/data/submissions`

Backups: `/opt/omk/OpenMapKitServer/data/backups`

Deployments: `/opt/omk/OpenMapKitServer/data/deployments`


### Potentially Helpful Tips

If you are on a POSM unit, for now, log in as `root`. You can also
`su` to `omk` if you are working in the command line. As long as
the files you upload are readable by the `omk` user, you will have
no problems. (TODO: Allow ssh with password for `omk` user)

If you are on a cloud or local server, You probably ssh with `ubuntu`
user. That should be fine as long as `/opt/omk/OpenMapKitServer/data`
is writable by all.

```
sudo chmod -R a+rw /opt/omk/OpenMapKitServer/data
```
