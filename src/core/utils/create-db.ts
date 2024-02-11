import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../config/logger';
import { env } from '..';

type KeyValuePairs<T> = {
  [K in keyof T]: { key: K; value: T[K] };
}[keyof T];

type CreateDbOptions<T> = {
  name: string;
  initialData?: T[];
};

type Db<T> = {
  getAll: () => T[] | null;
  create: (value: T) => T;
  getAllByKeyValue: ({ key, value }: KeyValuePairs<T>) => T[] | null;
  getFirstByKeyValue: ({ key, value }: KeyValuePairs<T>) => T | null;
  deleteByKeyValue: ({ key, value }: KeyValuePairs<T>) => number;
  deleteAll: () => number;
};

const readFromJsonFile = <T>(path: string): T[] | null => {
  try {
    const json = readFileSync(path, 'utf8');
    return JSON.parse(json);
  } catch (error: unknown) {
    logger.error({ error }, 'An error occurred trying to read from json file.');
    return null;
  }
};

const writeToJsonFile = <T>({ path, records }: { path: string; records: T[] }): void => {
  try {
    writeFileSync(path, JSON.stringify(records));
  } catch (error: unknown) {
    logger.error({ error }, 'An error occurred trying to write to json file.');
  }
};

export const createDb = <T>({ name, initialData }: CreateDbOptions<T>): Db<T> => {
  const dataDirectory = join(process.cwd(), env.DATA_DIR);
  if (!existsSync(dataDirectory)) {
    mkdirSync(dataDirectory);
  }

  const dbPath = join(process.cwd(), env.DATA_DIR, `${name}.json`);

  if (!existsSync(dbPath)) {
    initialData
      ? writeToJsonFile({ path: dbPath, records: initialData })
      : writeFileSync(dbPath, JSON.stringify([]));
  }

  return {
    getAll: () => {
      if (!existsSync(dbPath)) {
        return null;
      }

      return readFromJsonFile<T>(dbPath);
    },

    getAllByKeyValue: ({ key, value }) => {
      if (!existsSync(dbPath)) {
        return null;
      }

      const records = readFromJsonFile<T>(dbPath);

      if (!records) {
        return null;
      }

      return records.filter((e) => e[key] === value);
    },
    getFirstByKeyValue: ({ key, value }) => {
      if (!existsSync(dbPath)) {
        return null;
      }

      const records = readFromJsonFile<T>(dbPath);

      if (!records) {
        return null;
      }

      const foundRecord = records.find((e) => e[key] === value);

      if (!foundRecord) {
        return null;
      }

      return foundRecord;
    },
    create: (value: T) => {
      if (!existsSync(dbPath)) {
        writeToJsonFile({ path: dbPath, records: [value] });
        return { ...value };
      }

      const records = readFromJsonFile<T>(dbPath);

      if (!records) {
        writeToJsonFile({ path: dbPath, records: [value] });
        return { ...value };
      }

      writeToJsonFile({ path: dbPath, records: [...records, value] });
      return { ...value };
    },
    deleteByKeyValue: ({ key, value }) => {
      if (!existsSync(dbPath)) {
        return 0;
      }

      const records = readFromJsonFile<T>(dbPath);

      if (!records) {
        return 0;
      }

      const newRecords = records.filter((e) => e[key] !== value);

      writeToJsonFile({ path: dbPath, records: newRecords });

      return records.length - newRecords.length;
    },
    deleteAll: () => {
      if (!existsSync(dbPath)) {
        return 0;
      }

      const records = readFromJsonFile<T>(dbPath);

      if (!records) {
        return 0;
      }

      writeToJsonFile({ path: dbPath, records: [] });
      return records.length;
    },
  };
};
