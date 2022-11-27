import AWS = require('aws-sdk');
import { Context } from 'aws-lambda';

const client = new AWS.DynamoDB.DocumentClient();
import { logInfo, logError } from '../utils/logger';
import { ValidationError } from '../error/ValidationError'
import { TechnicalError } from '../error/TechnicalError';
import { UserNotFoundError } from '../error/UserNotFoundError';


type GetUserEvent = {
    arguments: {
        id: string
    }
}

export const getUserHandler = async function (event: GetUserEvent, context: Context) {

    logInfo('Received getUser request', context, {
        'arguments': JSON.stringify(event.arguments),
    });

    const { tableName } = validateTableNameVariable(context);

    const id = event.arguments.id;
    const { valid, message } = validate(id);
    if (!valid) {
        const err = new ValidationError(message);
        logError('Invalid request', context, err);
        return {
            statusCode: 400,
            body: JSON.stringify(err)
        };
    }

    return await getUserInDatabase(id, tableName, context);
}

function validateTableNameVariable(context: Context) {
    const tableName = process.env.USERS_TABLE;
    if (!tableName) {
      const err = new TechnicalError("Error Table name");
      logError("Error Table name undefined", context, err);
      throw err;
    }
    return { tableName };
  }


function validate(id: string) {
    if (!id) {
      return { valid: false, message: "Id must not be empty." };
    }
  
    return { valid: true };
  }

  async function getUserInDatabase(id: string, tableName: string, context: Context) {
    const params = {
      TableName: tableName,
      Key: { id: id }
    }
    try {
      const { Item } = await client.get(params).promise();
      const isItemFound = Item ? true : false;
      logInfo("User retrieved from database", context, { isItemFound: isItemFound });
      if (!isItemFound) {
        throw new UserNotFoundError("Error User not found for given Id");
      }
      return Item;
    } catch (err) {
      logError("Failed to retrieve User from DynamoDB", context, err);
      return {
        statusCode: 400,
        body: JSON.stringify(new TechnicalError(err.message))
      };
    }
  }