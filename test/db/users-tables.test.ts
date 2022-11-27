import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as UsersTable from '../../lib/db/users-table';

// TODO update db test
describe.skip('UsersTable Construct', () => {
  let stack : cdk.Stack;
  let table : UsersTable.UsersTable;
  beforeAll(() => {
    stack = new cdk.Stack();
    table = new UsersTable.UsersTable(stack, 'MyTestConstruct');
  });

  test('DynamoDB setup', () => {

    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table", {
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [{
        IndexName: "emailIndex",
        KeySchema: [{
          AttributeName: "email",
          KeyType: "HASH"
        }],
        Projection: {
          ProjectionType: "ALL"
        }
      }],
      KeySchema: [{
        AttributeName: "id",
        KeyType: "HASH"
      }],
      AttributeDefinitions: [{
        AttributeName: "id",
        AttributeType: "S"
      },{
        AttributeName: "email",
        AttributeType: "S"
      }]
    }));

    expect(table.table).toBeDefined();
    expect(table.emailIndexName).toBe("emailIndex");
  });
});