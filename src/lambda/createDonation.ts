import AWS = require('aws-sdk');
const Promise = require("bluebird");
import { Context } from 'aws-lambda';
const client = new AWS.DynamoDB.DocumentClient();
import  { SNSClient } from "@aws-sdk/client-sns";
const REGION = "REGION" // e.g. us-east-1
const snsClient = new SNSClient({ region: REGION });

import { PublishCommand } from "@aws-sdk/client-sns";

import { logInfo, logError } from '../utils/logger';
import { ValidationError } from '../error/ValidationError'
import { TechnicalError } from '../error/TechnicalError';


type CreateDonationEvent = {
    arguments: {
        id: string,
        donation: number
    }
}

export const createDonationHandler = async function (event: CreateDonationEvent, context: Context) {

    logInfo('Received create donation request', context, {
        'arguments': JSON.stringify(event.arguments),
    });

    const { tableName, sendPhoneNumber } = validateEnvironmentVariables(context);


    const id = event.arguments.id;
    const donation = event.arguments.donation;
    const { valid, message } = validate(id, donation);
    if (!valid) {
        const err = new ValidationError(message);
        logError('Invalid request', context, err);
        return {
            statusCode: 400,
            body: JSON.stringify(err)
        };
    }

    return await addDonation(id, donation, tableName, sendPhoneNumber, context);
    }


    function validateEnvironmentVariables(context: Context) {
        const tableName = process.env.USERS_TABLE;
        if (!tableName) {
          const err = new TechnicalError("Error Table name");
          logError("Error Table name undefined", context, err);
          throw err;
        }

        const sendPhoneNumber = process.env.SEND_PHONE_NUMBER;
        if (!sendPhoneNumber) {
          const err = new TechnicalError("User Number is undefined");
          logError("Error User Number is undefined", context, err);
          throw err;
        }

        return { tableName, sendPhoneNumber };
      }

    function validate(id: string, amount: number) {
        if (!id) {
          return { valid: false, message: "Id must not be empty." };
        }
      
        if (!amount || amount <= 0) {
          return { valid: false, message: "Donation amount must be a positive number." };
        }
      
        return { valid: true };
      }

      async function addDonation(id: string, donation: number, tableName: string, sendPhoneNumber: string, context: Context) {
        const update = Promise.promisify((client.update).bind(client));
        const donationParameters = {
          date: new Date().toISOString(),
          amount: donation
        }
        const params = {
          TableName: tableName,
          Key: { id: id },
          UpdateExpression: "SET donations = list_append(donations, :vals)",
          ExpressionAttributeValues: {
            ":vals": [donationParameters]
          },
          ReturnValues: "ALL_NEW"
        }
        try {
          const data = await update(params);
          logInfo("Donation saved to database", context);
      
          if (hasDonatedTwoOrMoreTimes(data)) {
            await sendThankYouSMS(data, sendPhoneNumber, context);
          }
          return donation;
        } catch (err) {
          logError("Error occured whilst creating donation", context, err);
          throw new TechnicalError(err.message);
        }
      }

      function hasDonatedTwoOrMoreTimes(data: AWS.DynamoDB.DocumentClient.UpdateItemOutput) {
        return data && data.Attributes && data.Attributes.donations.length >= 2;
      }
      

      async function sendThankYouSMS(data: AWS.DynamoDB.DocumentClient.UpdateItemOutput, sendPhoneNumber: string, context: Context) {
        if (!data.Attributes || !data) {
          return;
        }
      
        const sendPhoneNumberParams = {
          Message: `Dear ${data.Attributes.name} - Thank you for your donations!`,
          PhoneNumber: sendPhoneNumber
        };
        logInfo(`User has donated ${data.Attributes.donations.length} times, sending thank you message.`, context);
      
        try {
          const messageData = await snsClient.send(new PublishCommand(sendPhoneNumberParams));
          logInfo("Message successfully sent", context);
        } catch (err) {
          logError("Error while sending sms message", context, err);
        }
      }