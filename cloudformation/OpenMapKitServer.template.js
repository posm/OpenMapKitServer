const cf = require('@mapbox/cloudfriend');

const Parameters = {
  GitSha: {
    Description: 'Repository GitSha',
    Type: 'String'
  },
  ELBSubnets: {
    Description: 'ELB subnets',
    Type: 'String'
  },
  S3Bucket: {
    Description: 'S3 bucket',
    Type: 'String'
  },
  S3Prefix: {
    Description: 'S3 prefix for the bucket',
    Type: 'String'
  },
  OpenMapKitVersion: {
    Description: 'OpenMapKit Version, to download and extract the frontend',
    Type: 'String'
  },
  EnableS3Sync: {
    AllowedValues: [
     'true',
     'false'
    ],
    Default: 'true',
    Description: 'Enable S3 sync',
    Type: 'String'
  },
  EnableHTTPS: {
    AllowedValues: [
     'true',
     'false'
    ],
    Default: 'true',
    Description: 'Enable HTTPS (required to setup the form submission endpoint)',
    Type: 'String'
  },
  NodeEnvironment: {
    AllowedValues: [
     'production',
     'staging'
    ],
    Default: 'staging',
    Description: 'NODE_ENV environment variable',
    Type: 'String'
  },
  SSLCertificateIdentifier: {
    Type: 'String',
    Description: 'SSL certificate for HTTPS protocol'
  },
  UsersS3Bucket: {
    Description: 'Bucket with login details. Logins are stored at S3://<UsersS3Bucket>/settings/<OMK_stack_name>/users.json',
    Type: 'String'
  }
};

const Resources = {
  OpenMapKitServerASG: {
    DependsOn: 'OpenMapKitServerLaunchConfiguration',
    Type: 'AWS::AutoScaling::AutoScalingGroup',
    Properties: {
      AutoScalingGroupName: cf.stackName,
      Cooldown: 300,
      MinSize: 1,
      DesiredCapacity: 1,
      MaxSize: 5,
      HealthCheckGracePeriod: 300,
      LaunchConfigurationName: cf.ref('OpenMapKitServerLaunchConfiguration'),
      HealthCheckType: 'EC2',
      AvailabilityZones: cf.getAzs(cf.region),
      TargetGroupARNs: [cf.ref('OpenMapKitServerTargetGroup')]
    },
    UpdatePolicy: {
      AutoScalingRollingUpdate: {
        PauseTime: 'PT60M',
        WaitOnResourceSignals: true
      }
    }
  },
  OpenMapKitServerScaleUp: {
      Type: 'AWS::AutoScaling::ScalingPolicy',
      Properties: {
        AutoScalingGroupName: cf.ref('OpenMapKitServerASG'),
        PolicyType: 'TargetTrackingScaling',
        TargetTrackingConfiguration: {
          TargetValue: 80,
          PredefinedMetricSpecification: {
            PredefinedMetricType: 'ASGAverageCPUUtilization'
          }
        },
        Cooldown: 300
      }
  },
  OpenMapKitServerLaunchConfiguration: {
    Type: 'AWS::AutoScaling::LaunchConfiguration',
      Properties: {
        IamInstanceProfile: cf.ref('OpenMapKitServerEC2InstanceProfile'),
        ImageId: 'ami-0565af6e282977273',
        InstanceType: 'c5d.large',
        SecurityGroups: [cf.importValue(cf.join('-', ['hotosm-network-production', cf.ref('NodeEnvironment'), 'ec2s-security-group', cf.region]))],
        UserData: cf.userData([
          '#!/bin/bash',
          'set -x',
          'while [ ! -e /dev/nvme1n1 ]; do echo waiting for /dev/xvdc to attach; sleep 10; done',
          'mkfs.ext4 -E nodiscard /dev/nvme1n1',
          'sudo mkdir -p /app',
          'mount /dev/nvme1n1 /app',
          'rm -rf /app',
          'export DEBIAN_FRONTEND=noninteractive',
          'export LC_ALL="en_US.UTF-8"',
          'export LC_CTYPE="en_US.UTF-8"',
          'dpkg-reconfigure --frontend=noninteractive locales',
          'DEBIAN_FRONTEND=noninteractive apt update &&',
          'DEBIAN_FRONTEND=noninteractive apt -o Dpkg::Options::="--force-confold" upgrade -q -y --force-yes &&',
          'DEBIAN_FRONTEND=noninteractive apt -o Dpkg::Options::="--force-confold" dist-upgrade -q -y --force-yes',
          'apt install -y --no-install-recommends apt-transport-https curl software-properties-common &&',
          'curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash',
          'export NVM_DIR="$HOME/.nvm"',
          '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"',
          '[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"',
          'nvm install v8',
          'apt install -y --no-install-recommends build-essential default-jre-headless git nodejs python python-dev python-pip python-setuptools python-wheel s3cmd',
          'apt-get clean',
          'rm -rf /var/lib/apt/lists/*',
          'npm install -g yarn pm2',
          cf.sub('export AWSBUCKETNAME=${S3Bucket}'),
          cf.sub('export AWSBUCKETPREFIX=${S3Prefix}'),
          cf.sub('export ENABLES3SYNC=${EnableS3Sync}'),
          cf.sub('export ENABLE_HTTPS=${EnableHTTPS}'),
          cf.sub('export NODE_ENV=${NodeEnvironment}'),
          'export HOME="/root"',
          'cd /app && git clone https://github.com/hotosm/OpenMapKitServer.git .',
          cf.sub('git reset --hard ${GitSha}'),
          'cp ./cloudformation/systemd.conf /etc/systemd/journald.conf',
          'systemctl restart systemd-journald',
          'pip install -r requirements.txt',
          cf.sub('aws s3 cp s3://${UsersS3Bucket}/settings/OpenMapKitServer-${S3Prefix}/users.json /app/util/users.json'),
          'yarn && rm -rf /root/.cache/yarn',
          'export LC_ALL=C',
          'wget https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-latest.tar.gz && pip2 install aws-cfn-bootstrap-latest.tar.gz',
          cf.sub('wget https://github.com/hotosm/OpenMapKitServer/archive/${OpenMapKitVersion}-frontend.tar.gz -P /tmp/'),
          'rm frontend/build/* -R',
          cf.sub('tar -xvzf /tmp/${OpenMapKitVersion}-frontend.tar.gz -C frontend/build/ --strip 1'),
          'yarn get_from_s3',
          'pm2 start server.js &',
          cf.sub('cfn-signal --exit-code $? --region ${AWS::Region} --resource OpenMapKitServerASG --stack ${AWS::StackName}')
        ]),
        KeyName: 'mbtiles'
      }
  },
  OpenMapKitServerEC2Role: {
    Type: 'AWS::IAM::Role',
    Properties: {
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: {
             Service: [ 'ec2.amazonaws.com' ]
          },
          Action: [ 'sts:AssumeRole' ]
        }]
      },
      Policies: [{
        PolicyName: 'S3Policy',
        PolicyDocument: {
          Version: '2012-10-17',
          Statement:[{
            Action: [ 's3:ListBucket'],
            Effect: 'Allow',
            Resource: [
              cf.sub('arn:aws:s3:::${S3Bucket}'),
              cf.sub('arn:aws:s3:::${UsersS3Bucket}')
            ]
          }, {
            Action: [
                's3:GetObject',
                's3:GetObjectAcl',
                's3:PutObject',
                's3:PutObjectAcl',
                's3:ListObjects',
                's3:DeleteObject'
            ],
            Effect: 'Allow',
            Resource: [
                cf.sub('arn:aws:s3:::${S3Bucket}*')
            ]
          }, {
           Action: [
               's3:GetObject',
               's3:GetObjectAcl',
               's3:ListObjects'
           ],
           Effect: 'Allow',
           Resource: [
               cf.join('/', [cf.sub('arn:aws:s3:::${UsersS3Bucket}/settings'), cf.stackName, 'users.json'])
           ]
         }]
        }
      }, {
        PolicyName: "CloudFormationPermissions",
        PolicyDocument: {
          Version: "2012-10-17",
          Statement:[{
            Action: [
              'cloudformation:SignalResource',
              'cloudformation:DescribeStackResource'
            ],
            Effect: 'Allow',
            Resource: ['arn:aws:cloudformation:*']
          }]
        }
      }],
      RoleName: cf.join('-', [cf.stackName, 'ec2', 'role'])
    }
  },
  OpenMapKitServerEC2InstanceProfile: {
     Type: 'AWS::IAM::InstanceProfile',
     Properties: {
        Roles: [cf.ref('OpenMapKitServerEC2Role')],
        InstanceProfileName: cf.join('-', [cf.stackName, 'ec2', 'instance', 'profile'])
     }
  },
  OpenMapKitServerLoadBalancer: {
    Type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
    Properties: {
      Name: cf.stackName,
      SecurityGroups: [cf.importValue(cf.join('-', ['hotosm-network-production', cf.ref('NodeEnvironment'), 'elbs-security-group', cf.region]))],
      Subnets: cf.split(',', cf.ref('ELBSubnets')),
      Type: 'application'
    }
  },
  OpenMapKitServerTargetGroup: {
    Type: 'AWS::ElasticLoadBalancingV2::TargetGroup',
    Properties: {
      HealthCheckIntervalSeconds: 60,
      HealthCheckPort: 3210,
      HealthCheckProtocol: 'HTTP',
      HealthCheckTimeoutSeconds: 10,
      HealthyThresholdCount: 3,
      UnhealthyThresholdCount: 3,
      Port: 3210,
      Protocol: 'HTTP',
      VpcId: cf.importValue(cf.join('-', ['hotosm-network-production', 'default-vpc', cf.region])),
      Matcher: {
        HttpCode: '200,202,302,304'
      }
    }
  },
  OpenMapKitServerLoadBalancerHTTPSListener: {
    Type: 'AWS::ElasticLoadBalancingV2::Listener',
    Properties: {
      Certificates: [ {
        CertificateArn: cf.arn('acm', cf.ref('SSLCertificateIdentifier'))
      }],
      DefaultActions: [{
        Type: 'forward',
        TargetGroupArn: cf.ref('OpenMapKitServerTargetGroup')
      }],
      LoadBalancerArn: cf.ref('OpenMapKitServerLoadBalancer'),
      Port: 443,
      Protocol: 'HTTPS'
    }
  },
  OpenMapKitServerLoadBalancerHTTPListener: {
    Type: 'AWS::ElasticLoadBalancingV2::Listener',
    Properties: {
      DefaultActions: [{
        Type: 'redirect',
        RedirectConfig: {
          Protocol: 'HTTPS',
          Port: '443',
          Host: '#{host}',
          Path: '/#{path}',
          Query: '#{query}',
          StatusCode: 'HTTP_301'
        }
      }],
      LoadBalancerArn: cf.ref('OpenMapKitServerLoadBalancer'),
      Port: 80,
      Protocol: 'HTTP'
    }
  },
};

module.exports = { Parameters, Resources }
