# Public Directory

This is the de-facto public directory in which OpenMapKit Server serves
data and static assets. You can modify the public directory in `settings.js`.

Within the forms directory are several example ODK XForms. These forms
are available from ODK Collect if you enter the `<server_url>/odk` as
your server URL. When [uploading forms](https://github.com/AmericanRedCross/OpenMapKitServer/tree/master/public/upload-form), 
the original XLS Excel form, as well as the XForm XML product are stored side by side.

Submissions to the open `odk` endpoint are written to the `submissions` directory.

Deployment provisioning data and their manifests are in the `deployments` directory.
