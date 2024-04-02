import { SnsTopicDto } from '@mini-aws-mock/shared';

export const deleteTopic = async (topic: SnsTopicDto): Promise<void> => {
  const fetchResponse = await fetch(`http://localhost:8000/sns/topics/${topic.arn}`, {
    method: 'DELETE',
  });

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while attempting to delete topic.');
  }
};
