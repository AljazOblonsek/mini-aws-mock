import { extractMessageAttributesFromObject } from './extract-message-attributes-from-object';

describe('extractMessageAttributesFromObject', () => {
  it('should correctly extract message attributes based on simple prefix', () => {
    const body = {
      QueueUrl: 'http://sqs.eu-central-1.localhost:8000/00000000/audio-processing',
      MessageBody: '{"file":"far-beyond-the-sun.mp3","convertToFormat":"aac"}',
      'MessageAttribute.1.Name': 'Type',
      'MessageAttribute.1.Value.StringValue': 'AudioFormatConvert',
      'MessageAttribute.1.Value.DataType': 'String',
      'MessageAttribute.2.Name': 'Processor',
      'MessageAttribute.2.Value.StringValue': 'Fast',
      'MessageAttribute.2.Value.DataType': 'String',
      Action: 'SendMessage',
      Version: '2012-11-05',
    };

    const messageAttributes = extractMessageAttributesFromObject({
      prefix: 'MessageAttribute',
      object: body,
    });

    expect(messageAttributes).toEqual([
      {
        Name: body['MessageAttribute.1.Name'],
        Value: {
          DataType: body['MessageAttribute.1.Value.DataType'],
          StringValue: body['MessageAttribute.1.Value.StringValue'],
        },
      },
      {
        Name: body['MessageAttribute.2.Name'],
        Value: {
          DataType: body['MessageAttribute.2.Value.DataType'],
          StringValue: body['MessageAttribute.2.Value.StringValue'],
        },
      },
    ]);
  });
  it('should correctly extract message attributes based on advanced prefix', () => {
    const body = {
      TopicArn: 'arn:aws:sns:eu-central-1:00000000:my-topic-111',
      Message: '{"one":"two","three":4,"five":false}',
      'MessageAttributes.entry.1.Name': 'Type',
      'MessageAttributes.entry.1.Value.DataType': 'String',
      'MessageAttributes.entry.1.Value.StringValue': 'CustomerCreate',
      'MessageAttributes.entry.2.Name': 'Action',
      'MessageAttributes.entry.2.Value.DataType': 'String',
      'MessageAttributes.entry.2.Value.StringValue': 'PushNotificationToMobile',
      'Yikes.entry.1.Name': 'Omg',
      Action: 'Publish',
      Version: '2010-03-31',
    };

    const messageAttributes = extractMessageAttributesFromObject({
      prefix: 'MessageAttributes.entry',
      object: body,
    });

    expect(messageAttributes).toEqual([
      {
        Name: body['MessageAttributes.entry.1.Name'],
        Value: {
          DataType: body['MessageAttributes.entry.1.Value.DataType'],
          StringValue: body['MessageAttributes.entry.1.Value.StringValue'],
        },
      },
      {
        Name: body['MessageAttributes.entry.2.Name'],
        Value: {
          DataType: body['MessageAttributes.entry.2.Value.DataType'],
          StringValue: body['MessageAttributes.entry.2.Value.StringValue'],
        },
      },
    ]);
  });
});
