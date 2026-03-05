import { app } from './app.js';
import { env } from './config/env.js';
import { db } from './config/db.js';

async function bootstrap() {
  try {
    await db.$connect();
    app.listen(env.PORT, () => {
      console.log(`ARCA backend listening on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
