import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
  // Extract hostname from DATABASE_URL to determine if using Neon Local
  const dbUrl = new URL(process.env.DATABASE_URL);
  const isNeonLocal = dbUrl.hostname === 'neon-local' || dbUrl.hostname === 'localhost';
  
  if (isNeonLocal) {
    // Configure for HTTP-only communication with Neon Local
    neonConfig.fetchEndpoint = `http://${dbUrl.hostname}:${dbUrl.port || 5432}/sql`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;
  }
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };
