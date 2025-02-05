// config/configuration.ts
import { registerAs } from '@nestjs/config';

export default registerAs('scheduler', () => ({
  provider1Cron: process.env.PROVIDER1_CRON || '0 * * * *', // Every hour by default
  provider2Cron: process.env.PROVIDER2_CRON || '30 * * * *', // Every hour at the 30th minute by default
}));
