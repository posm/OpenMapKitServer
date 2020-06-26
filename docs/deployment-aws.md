# Deploying to AWS


## Requirements: 

### [mapbox/cfn-config](https://github.com/mapbox/cfn-config)

Follow the prerequisites for installation for the cfn-config tool, then install using npm.

```
npm install -g @mapbox/cfn-config
```

**Other Requirements**
- AWS permissions to access S3 buckets, cloudformation templates, and route53 records
- AWS Domain and SSL certificate on ACM

### OMK Config bucket

Create an S3 bucket to hold the form data (in this doc we will use `s3://OpenMapKitServer-storage`), and a folder in that bucket called `settings/`. 

## Deploying OMK

`cfn-config` creates a CloudFormation template and manages the deployment to AWS resources. Be sure to give a relevant name to this deployment (aka application stack). We will use `example`. Before deploying, configure the `cloudformation/users.json` file as needed and upload to `s3://OpenMapKitServer-storage/settings/OpenMapKitServer-example/`. Then run the `cfn-config command`:

```
cfn-config create example cloudformation/OpenMapKitServer.template.js -t <cfn-config-bucket> -c <cfn-config-bucket>
```

`<cfn-config-bucket>` is the bucket created while installing cfn-config. The tool will prompt the following parameters:

```
? Saved configurations New configuration
? GitSha. Repository GitSha: <The Git hash of the most recent version of OMK Server>
? ELBSubnets. ELB subnets: <A comma-separated string of subnets the EC2 can run on>
? S3Bucket. S3 bucket: OpenMapKitServer-storage
? S3Prefix. S3 prefix for the bucket: example
? OpenMapKitVersion. OpenMapKit Version, to download and extract the frontend: v1.5.1
? EnableS3Sync. Enable S3 sync: true
? EnableHTTPS. Enable HTTPS (required to setup the form submission endpoint): true
? NodeEnvironment. NODE_ENV environment variable: production
? SSLCertificateIdentifier. SSL certificate for HTTPS protocol: <ACM Certificate ID>
? UsersS3Bucket. Bucket with login details. Logins are stored at S3://<UsersS3Bucket>/settings/<OMK_stack_name>/users.json: OpenMapKitServer-storage
? Ready to create the stack? (Y/n) 
```

When the process is finished, the IP address to access OMK will be found in the EC2 Application Load Balancer console. 