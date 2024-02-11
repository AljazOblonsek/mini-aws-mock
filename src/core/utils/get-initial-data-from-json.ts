import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../config/logger';

export const getInitialDataFromJson = <T>(name: string): T[] => {
  const initialDataDirectory = join(process.cwd(), 'initial-data');

  if (!existsSync(initialDataDirectory)) {
    return [];
  }

  const initialDataFilePath = join(initialDataDirectory, `${name}.json`);

  if (!existsSync(initialDataFilePath)) {
    return [];
  }

  const json = readFileSync(initialDataFilePath, 'utf8');

  try {
    return JSON.parse(json);
  } catch (error: unknown) {
    logger.debug({ error }, 'An unknown error occurred while trying to parse json.');
    return [];
  }
};
