import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private sequelize: Sequelize) {}

  async check() {
    const dbStatus = await this.checkDatabase();
    const isHealthy = dbStatus.status === 'up';

    return {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
      },
    };
  }

  async readiness() {
    const dbStatus = await this.checkDatabase();
    const isReady = dbStatus.status === 'up';

    return {
      status: isReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
      },
    };
  }

  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<{ status: string; message?: string }> {
    try {
      await this.sequelize.authenticate();
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  }
}
