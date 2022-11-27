# CRUK Node.js Recruitment Assignment

### Repository Overview

This repository includes a Node.js service which exposes a Typescript API that checks how many donations a User has made and sends a thank you message if 2 or more donations are made. This service can be deployed with AWS Cloud Development Kit (CDK).

### Installation and Deployment

 You will need to ensure that Node is installed on your local machine. The following commands can be used to deploy AWS CDK apps which includes the process of provisioning stack resources. The AWS CDK takes the deployment artifacts cloud assembly produces and deploys it to an AWS environment. When deploying input parameters to cdk deploy should be included.

```
 npm install
 npm run build
 cdk bootstrap
 cdk deploy --parameters sendPhoneNumber=+442034698797
 ```

### API

The API includes:
createUser(name: string, email: string) - creates a user in the store
  - POST https://DOMAIN/createUser/{name}/{email}
 
getUser(email: string) - retrieves user information
  - GET https://DOMAIN/getUser/{id}

createDonation(email: string, donation: number) - creates and stores a donation with respect to a given user. If 2 or more donations are stored a message is sent.
  - POST https://DOMAIN/createDonation/{email}/{donation}

### Stack

An AWS API gateway is used to expose the API. The stack includes three Node.js lambdas. DynamoDB is used to persist the storage of data and SMS Messages are sent with Amazon SNS.


### Scaling the solution

- The use of DynamoDB allows for scalablity of the data store. Auto-scaling can be enabled. Should usage demand alternate payment methods can be used other than the pay per request model which can be advantageous if usesage is low or unpredictable.
- There are limitations for the API gateway such as the requests per second (rps).
- Testing under load, similating the upper thresholds expected in production would be a good method to forecast and antipate performance hence make additional enchancments
- Concurrent execution limit exist for the lambdas, however these can be adjusted as required for the needs of the application such as once load testing is performed.
- Alternate compute platforms/ engines are availabe and can be considered e.g. Amazon EC2/ AWS Fargate
- AWS CloudFormation usages speeds up cloud provisioning with infrastructure as code which can also provide an application dashboard
-  Each Stack instance in your AWS CDK app is explicitly or implicitly associated with an environment. An environment is the target AWS account and Region into which the stack is intended to be deployed and can be configured
- The unit of deployment in the AWS CDK is a stack. All AWS resources defined within the scope of a stack are provisioned as a single unit. As stacks are implemented through AWS CloudFormation stacks, they have the same limitations.

### Monitoring and Logging

- Many resources emit CloudWatch metrics that can be used to set up monitoring dashboards and alarms. 
- Metrics can be used to capture log lines hence filter on the log group, to populating CloudWatch and CloudWatch dashboard can be monitored
- Metrics for each lambda and associated dependencies can be unitilised and analysed
- CloudWatch alarms can be used including on service limits to prevent outages due to user demand
- Passing senstive information (emails) as a request parameter is non recommended for production as safeguarding user details is important
- A extensive codepipeline can be used to test the code and configure how services will be deployed in different environments e.g. staging, production. With an appropriate setup code can be automatically built and deployed, when reviewed and committed without manual intervention
- Request ID can be used to track the flow of requests though services and handlers
- Critical paths and key events (e.g. fatal errors, success, incoming requests) should be logged in JSON format which allows the logs to be parsed using e.g. CloudWatch insights

### Authentication

- Most AWS constructs have a set of grant methods that you can use to grant AWS Identity and Access Management (IAM) permissions on that construct and to work with the resource
- Retrictions such as certain roles only can be able to call the API eg, AWS IAM Permissions with AWS API Gateway
- Also for the dynamodb different access permissions could be granted for the differnet lambdas e.g. grantReadWriteData or grantReadData

### Future improvements

- Include additional automated unit tests cases 
- Build pipeline
- Implement appropriate authentication strategies

### Notes

- Orginal code available here https://github.com/CRUKorg/CRUK-backend-assignment
- Resources consulted in the composition of this repository include:
    - https://docs.aws.amazon.com/cdk/v2/guide/home.html
    - https://aws.amazon.com/cdk/features/
    - https://docs.aws.amazon.com/lambda/latest/dg/welcome.html
    - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html
    - https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html
    - https://crukorg.github.io/engineering-guidebook/docs/best_practices/backend/monitoring/

- Further indepth understanding of such resources would be used in the future for greater knowledge of tools, techniques, standards and alternate methods that would be useful for the advancement and maintainace of this service.