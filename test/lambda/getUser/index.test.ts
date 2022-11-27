import AWS = require('aws-sdk');
import { mockContext } from "../../mockContext";

const item = { id: "testUserId", name: "testName", email: "testName@email.com", donations: [{"date": "27.01.2020", "amount": 20}] }
const mockDynamoDbGet = jest.fn().mockImplementation(() => {
  return {
    promise() {
      return Promise.resolve({Item: item});
    }
  };
});

const mockDocumentClient = jest.fn(() => ({
  get: mockDynamoDbGet
}));

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: mockDocumentClient
    }
  };
});

import { getUserHandler } from '../../../src/lambda/getUser';


beforeEach(() => {
  jest.clearAllMocks();
  process.env.USERS_TABLE = "usersTablename";
  process.env.EMAIL_INDEX = "emailIndexName";
});

test('Get user', async () => {

  const result = await getUserHandler({
    arguments: {
      id: "testUserId"
    }
  }, mockContext);

  expect(result).toBe(item);
  expect(mockDynamoDbGet).toHaveBeenCalledWith({
    TableName: "usersTablename",
    Key: { id: "testUserId" }
  });
});

test('Get user invalid id', async () => {
  
  const result = await getUserHandler({
      arguments: {
        id: ""
      }
    }, mockContext)
  
  await expect(result).toMatchObject({"body": "{\"name\":\"ValidationError\"}", "statusCode": 400});
});