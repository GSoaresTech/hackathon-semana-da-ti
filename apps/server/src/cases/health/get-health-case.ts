import { connection } from '~/libs/connection';

type HealthCaseOutput = {
  status: 'ok';
  uptime: number;
  timestamp: string;
  database_status: string;
};

async function health_case(): Promise<HealthCaseOutput> {
  let database_status: string;

  try {
    await connection.raw('SELECT 1;');
    database_status = 'connected';
  } catch (error) {
    database_status = 'disconnected';
  }

  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database_status,
  };
}

export { health_case };
