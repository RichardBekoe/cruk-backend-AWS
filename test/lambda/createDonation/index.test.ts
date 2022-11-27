import { mockContext } from "../../mockContext";

jest.mock('bluebird', () => {
  return {
    Promise: {
      promisify: jest.fn()
    }
  };
});

const mockDynamoDbUpdate = jest.fn().mockImplementation(() => {
  return {
    promise() {
      return Promise.resolve({
        Attributes: {
          donations: [{}, {}],
          email: "test@email.com",
          name: "donatorName"
        }
      });
    }
  };
});
const mockDocumentClient = jest.fn(() => ({
  update: mockDynamoDbUpdate
}));
const mockSNSMessage = jest.fn();
const mockSNSClient = jest.fn(() => ({
  send: mockSNSMessage
}));

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: mockDocumentClient
    },
    SNSClient: mockSNSClient
  };
});
import { createDonationHandler } from '../../../src/lambda/createDonation';

beforeEach(() => {
  jest.clearAllMocks();
  process.env.USERS_TABLE = "usersTablename";
  process.env.EMAIL_INDEX = "emailIndexName";
  process.env.SEND_PHONE_NUMBER= "+442034698797";
});
// TODO update test
// jest.setTimeout.Timeout - Async callback was not invoked within the 5000 ms
describe.skip('Create Donation Tests', () => {
  test('Create donation', async () => {
    const result = await createDonationHandler({
      arguments: {
          id: "userId",
          donation: 123.4
        }
    }, mockContext);

    expect(result).toMatchObject({ amount: 123.4, date: expect.anything() });
    expect(mockDynamoDbUpdate).toHaveBeenCalledWith({
      TableName: "usersTableName",
      Key: { id: "userId" },
      UpdateExpression: "SET donations = list_append(donations, :vals)",
      ExpressionAttributeValues: {
        ":vals": [expect.objectContaining({ amount: 123.4, date: expect.anything() })]
      }
    });
    expect(mockSNSMessage).toHaveBeenCalledWith({
      Message: "Dear donatorName - Thank you for your donations!",
      PhoneNumber: "+442034698797"
    });
  });
});