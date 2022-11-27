import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';

export class UsersTable extends cdk.Construct {

  public readonly table: ddb.Table;
  public readonly emailIndexName: string;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.table = new ddb.Table(this, 'UsersTable', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      }
    });
    this.emailIndexName = 'emailIndex';
    this.table.addGlobalSecondaryIndex({
      indexName: this.emailIndexName,
      partitionKey: {
        name: 'email',
        type: ddb.AttributeType.STRING,
      }
    });
  }
}