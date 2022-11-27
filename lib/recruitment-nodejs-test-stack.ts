import * as cdk from '@aws-cdk/core';
import { UsersTable } from './ddb/users-table';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as path from 'path';

export class RecruitmentNodejsTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userTable = new UsersTable(this, 'UsersTable');

    const api = new apigateway.RestApi(this, "user-donations-api");

    const createUserHandler = new NodejsFunction(this, "CreateUserHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "createUserHandler",
      entry: path.join(__dirname, `/../src/lambda/createUser.ts`),
      memorySize: 1024,
      environment: {
        USERS_TABLE: userTable.table.tableName,
        EMAIL_INDEX: userTable.emailIndexName
      }
    });

    const getUserHandler = new NodejsFunction(this, "GetUserHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "getUserHandler",
      entry: path.join(__dirname, `/../src/lambda/getUser.ts`),
      memorySize: 1024,
      environment: {
        USERS_TABLE: userTable.table.tableName,
        EMAIL_INDEX: userTable.emailIndexName
      }
    });

    const createUserIntegration = new apigateway.LambdaIntegration(createUserHandler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const getUserIntegration = new apigateway.LambdaIntegration(getUserHandler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const createUserApi = api.root.addResource("createUser");
    createUserApi.addResource("{name}").addResource("{email}").addMethod("POST", createUserIntegration);

    const getUserApi = api.root.addResource("getUser");
    getUserApi.addResource("{id}").addMethod("GET", getUserIntegration);

  }
}