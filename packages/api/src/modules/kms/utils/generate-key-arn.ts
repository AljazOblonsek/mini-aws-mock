type GenerateKeyArnOptions = {
  region: string;
  userId: string;
  keyId: string;
};

export const generateKeyArn = ({ region, userId, keyId }: GenerateKeyArnOptions): string => {
  return `arn:aws:kms:${region}:${userId}:key/${keyId}`;
};
