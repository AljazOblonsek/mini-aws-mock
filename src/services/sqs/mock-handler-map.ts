import { Request, Response } from 'express';

export const mockHandlerMap = {} as Readonly<
  Record<string, (req: Request, res: Response) => Response>
>;
