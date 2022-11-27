import AWS = require('aws-sdk');
import { Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const client = new AWS.DynamoDB.DocumentClient();
import { logInfo, logError } from '../utils/logger';
import { ValidationError } from '../error/ValidationError'
import { TechnicalError } from '../error/TechnicalError';


type CreateUserEvent = {
  arguments: {
    name: string,
    email: string,
  }
}

export const createUserHandler = async function (event: CreateUserEvent, context: Context) {

  logInfo('Received create user request', context, {
    'arguments': JSON.stringify(event.arguments),
  });

  const { tableName } = validateTableNameVariable(context);

  const name = event.arguments.name;
  const email = event.arguments.email;
 
  const { valid, message } = validate(name, email);
  if (!valid) {
    const err = new ValidationError(message);
    logError('Invalid request', context, err);
    return {
      statusCode: 400,
      body: JSON.stringify(err)
    };
  }

  return await createUserInDatabase(name, email, tableName, context);
}

function validateTableNameVariable(context: Context) {
  const tableName = process.env.USERS_TABLE;
  if (!tableName) {
    const err = new TechnicalError("Error Table name undefined");
    logError("Error Table name undefined", context, err);
    throw err;
  }
  return { tableName };
}

async function createUserInDatabase(name: string, email: string, tableName: string, context: Context) {
  const user = {
    id: uuidv4(),
    name: name,
    email: email,
    donations: []
  }

  const params = {
    TableName: tableName,
    Item: user,
  }
  try {
    await client.put(params).promise();
    logInfo("User saved to DynamoDB", context);
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    };
  } catch (err) {
    logError("Failed to store User in DynamoDB", context, err);
    return {
      statusCode: 400,
      body: JSON.stringify(new TechnicalError(err.message))
    };
  }
}

function validate(name: string, email: string) {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  if (!name) {
    return { valid: false, message: "Name must not be empty." };
  }
  if (name.length > 60) {
    return { valid: false, message: "Name must be shorter than 60 characters." };
  }
  if (!email) {
    return { valid: false, message: "Email must not be empty." };
  }
  if (!re.test(email)) {
    return { valid: false, message: "The input email is not valid." }
  }
  return { valid: true };
}