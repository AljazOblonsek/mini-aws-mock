import '@nestjs/config';
import { EnvironmentVariablesSchema } from './environment-variables.schema';

declare module '@nestjs/config' {
  export declare class ConfigService {
    get<T extends keyof EnvironmentVariablesSchema>(
      propertyPath: T
    ): EnvironmentVariablesSchema[T] | undefined;
    get<T extends keyof EnvironmentVariablesSchema>(
      propertyPath: T,
      defaultValue: EnvironmentVariablesSchema[T]
    ): Exclude<EnvironmentVariablesSchema[T], undefined>;
    getOrThrow<T extends keyof EnvironmentVariablesSchema>(
      propertyPath: T
    ): Exclude<EnvironmentVariablesSchema[T], undefined>;
    getOrThrow<T extends keyof EnvironmentVariablesSchema>(
      propertyPath: T,
      defaultValue: EnvironmentVariablesSchema[T]
    ): Exclude<EnvironmentVariablesSchema[T], undefined>;
  }
}
