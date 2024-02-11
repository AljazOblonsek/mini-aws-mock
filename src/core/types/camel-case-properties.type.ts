export type CamelCaseProperties<T> = {
  [K in keyof T as Uncapitalize<K & string>]: T[K];
};
