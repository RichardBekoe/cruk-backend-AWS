import * as cdk from '@aws-cdk/core';
import { UsersTable } from './db/users-table';
import * as lambdaNodeJs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as path from 'path';

export class RecruitmentNodejsTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userTable = new UsersTable(this, 'UsersTable');

    const api = new apigateway.RestApi(this, "user-donations-api");

    
    const sendPhoneNumber = new cdk.CfnParameter(this, "sendPhoneNumber", {
      type: "String",
      description: "The phone number from which thank you messages will be sent."
    });

    const createUserHandler = new lambdaNodeJs.NodejsFunction(this, "CreateUserHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "createUserHandler",
      entry: path.join(__dirname, `/../src/lambda/createUser.ts`),
      memorySize: 1024,
      environment: {
        USERS_TABLE: userTable.table.tableName,
        EMAIL_INDEX: userTable.emailIndexName
      }
    });

    const getUserHandler = new lambdaNodeJs.NodejsFunction(this, "GetUserHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "getUserHandler",
      entry: path.join(__dirname, `/../src/lambda/getUser.ts`),
      memorySize: 1024,
      environment: {
        USERS_TABLE: userTable.table.tableName,
        EMAIL_INDEX: userTable.emailIndexName
      }
    });

    const createDonationHandler = new lambdaNodeJs.NodejsFunction(this, "CreateDonationHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "createDonationHandler",
      entry: path.join(__dirname, `/../src/lambda/createDonation.ts`),
      memorySize: 1024,
      environment: {
        USERS_TABLE: userTable.table.tableName,
        EMAIL_INDEX: userTable.emailIndexName,
        SEND_PHONE_NUMBER: sendPhoneNumber.valueAsString
      }
    });

    const createUserIntegration = new apigateway.LambdaIntegration(createUserHandler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const getUserIntegration = new apigateway.LambdaIntegration(getUserHandler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const createDonationIntegration = new apigateway.LambdaIntegration(createDonationHandler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const createUserApi = api.root.addResource("createUser");
    createUserApi.addResource("{name}").addResource("{email}").addMethod("POST", createUserIntegration);

    const getUserApi = api.root.addResource("getUser");
    getUserApi.addResource("{id}").addMethod("GET", getUserIntegration);

    const createDonationApi = api.root.addResource("createDonation");
    createDonationApi.addResource("{email}").addResource("{donation}").addMethod("POST", createDonationIntegration);

  }
}