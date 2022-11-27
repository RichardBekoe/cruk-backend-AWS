import { Context } from 'aws-lambda';

export function logInfo(message: string, context: Context, extra?: Object) {
  console.log({
    "msg": message,
    "level": "INFO",
    "awsRequestId": context.awsRequestId,
    ...extra
  });
}

export function logError(message: string, context: Context, err: Error) {
  console.error({
    "msg": message,
    "level": "ERROR",
    "awsRequestId": context.awsRequestId,
    "err": err
  });
}