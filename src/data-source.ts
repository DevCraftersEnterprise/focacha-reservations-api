import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { register } from 'tsconfig-paths';

// Load environment variables
config();

// Register TypeScript path aliases for TypeORM CLI
register({
    baseUrl: join(__dirname, '..'),
    paths: {
        '@*': ['src/*'],
    },
});

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: false, // Always false for migrations
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
