export const mockContext = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: "a",
  functionVersion: "a",
  invokedFunctionArn: "a",
  memoryLimitInMB: "a",
  awsRequestId: "testAwsRequestId",
  logGroupName: "a",
  logStreamName: "a",
  getRemainingTimeInMillis: jest.fn(),
  done: jest.fn(),
  fail: jest.fn(),
  succeed: jest.fn()
};