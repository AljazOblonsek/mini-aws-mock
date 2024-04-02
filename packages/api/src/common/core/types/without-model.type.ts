import { Model } from 'sequelize-typescript';

type ModelWithoutDates = Omit<Model, 'createdAt' | 'updatedAt' | 'deletedAt'>;

export type WithoutModel<T> = Omit<T, keyof ModelWithoutDates>;
