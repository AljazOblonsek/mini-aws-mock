import app from '@/app';
import { AddressInfo } from 'net';

export class TestingModule {
  private server!: ReturnType<typeof app.listen>;

  async start(): Promise<this> {
    return new Promise((resolve) => {
      this.server = app.listen(process.env.PORT, () => {
        resolve(this);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        resolve();
      });
    });
  }

  getBaseUrl(): string {
    return `http://localhost:${(this.server.address() as AddressInfo).port}`;
  }
}
