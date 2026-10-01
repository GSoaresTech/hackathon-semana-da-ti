import { config } from './src/database/config';

export default config[
  (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production' | 'test'
];
