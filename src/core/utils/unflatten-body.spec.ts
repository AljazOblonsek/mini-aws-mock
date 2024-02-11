import { unflattenBody } from './unflatten-body';

describe('unflattenBody', () => {
  it('should correctly unflatten body with entries', () => {
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

    const unfalttenedBody = unflattenBody(body);

    expect(unfalttenedBody).toMatchObject({
      TopicArn: body.TopicArn,
      Message: body.Message,
      Action: body.Action,
      Version: body.Version,
      MessageAttributes: [
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
      ],
    });
  });
  it('should correctly unflatten body with members and entries', () => {
    const body = {
      TopicArn: 'arn:aws:sns:eu-central-1:00000000:my-topic-111',
      'PublishBatchRequestEntries.member.1.Id': '1',
      'PublishBatchRequestEntries.member.1.Message': '{"one":"two","three":4,"five":false}',
      'PublishBatchRequestEntries.member.1.MessageAttributes.entry.1.Name': 'Type',
      'PublishBatchRequestEntries.member.1.MessageAttributes.entry.1.Value.DataType': 'String',
      'PublishBatchRequestEntries.member.1.MessageAttributes.entry.1.Value.StringValue':
        'CustomerCreate',
      'PublishBatchRequestEntries.member.2.Id': '2',
      'PublishBatchRequestEntries.member.2.Message': '{"one":"two","three":4,"five":false}',
      'PublishBatchRequestEntries.member.2.MessageAttributes.entry.1.Name': 'Type',
      'PublishBatchRequestEntries.member.2.MessageAttributes.entry.1.Value.DataType': 'String',
      'PublishBatchRequestEntries.member.2.MessageAttributes.entry.1.Value.StringValue':
        'CustomerCreate',
      'PublishBatchRequestEntries.member.2.MessageAttributes.entry.2.Name': 'Notify',
      'PublishBatchRequestEntries.member.2.MessageAttributes.entry.2.Value.DataType': 'String',
      'PublishBatchRequestEntries.member.2.MessageAttributes.entry.2.Value.StringValue': 'True',
      Action: 'PublishBatch',
      Version: '2010-03-31',
    };

    const unfalttenedBody = unflattenBody(body);

    expect(unfalttenedBody).toMatchObject({
      TopicArn: body.TopicArn,
      Action: body.Action,
      Version: body.Version,
      PublishBatchRequestEntries: [
        {
          Id: '1',
          Message: '{"one":"two","three":4,"five":false}',
          MessageAttributes: [
            { Name: 'Type', Value: { DataType: 'String', StringValue: 'CustomerCreate' } },
          ],
        },
        {
          Id: '2',
          Message: '{"one":"two","three":4,"five":false}',
          MessageAttributes: [
            { Name: 'Type', Value: { DataType: 'String', StringValue: 'CustomerCreate' } },
            { Name: 'Notify', Value: { DataType: 'String', StringValue: 'True' } },
          ],
        },
      ],
    });
  });
});
