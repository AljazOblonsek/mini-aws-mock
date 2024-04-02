import { environmentVariablesSchema } from './environment-variables.schema';

export const validateEnvironmentVariables = (env: Record<string, any>): Record<string, any> => {
  return environmentVariablesSchema.parse(env);
};
