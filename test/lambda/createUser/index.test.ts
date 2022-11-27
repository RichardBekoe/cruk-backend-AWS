import { mockContext } from "../../mockContext";
import AWS = require('aws-sdk');

const mockDynamoDbPut = jest.fn().mockImplementation(() => {
  return {
    promise() {
      return Promise.resolve({});
    }
  };
});

const mockDocumentClient = jest.fn(() => ({
  put: mockDynamoDbPut
}));

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: mockDocumentClient
    }
  };
});

jest.mock('uuid', () => ({ v4: () => '123456789' }));


import { createUserHandler } from '../../../src/lambda/createUser';
import { ValidationError } from "../../../src/error/ValidationError";
import { TechnicalError } from "../../../src/error/TechnicalError";

beforeEach(() => {
  jest.clearAllMocks();
  process.env.USERS_TABLE = "usersTablename";
  process.env.EMAIL_INDEX = "emailIndexName";
});

test('Create user', async () => {
  
  const result = await createUserHandler({
    arguments: {
        email: "test@email.com",
        name: "testName"
    }
  }, mockContext );

  // THEN
  expect(result).toMatchObject({"body": "{\"id\":\"123456789\",\"name\":\"testName\",\"email\":\"test@email.com\",\"donations\":[]}", "statusCode": 200});
  expect(mockDynamoDbPut).toHaveBeenCalledWith({
    TableName: "usersTablename",
    Item: expect.objectContaining({ id: expect.anything(), name: "testName", email: "test@email.com", donations: [] })
  });
});

test('Create user empty name', async () => {
  const result = await createUserHandler({
    arguments: {
        email: "test@email.com",
        name: ""
    }
  }, mockContext );
  await expect(result).toMatchObject({"body": "{\"name\":\"ValidationError\"}", "statusCode": 400});
});