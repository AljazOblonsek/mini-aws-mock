export const purgePublishHistory = async (): Promise<void> => {
  const fetchResponse = await fetch('http://localhost:8000/sns/topics/publish-history/purge', {
    method: 'DELETE',
  });

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while attempting to purge publish history.');
  }
};
