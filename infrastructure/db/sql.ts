import postgres, { type Sql } from 'postgres';
import getEnv from '@/utilities/getEnv';

let sql: Sql | null = null;

const getDbConnection = (): Sql => {
  if (!sql) {
    const user = getEnv('POSTGRES_USER');
    const password = getEnv('POSTGRES_PASSWORD');
    const host = getEnv('POSTGRES_HOST');
    const port = getEnv('POSTGRES_PORT');
    const dbName = getEnv('POSTGRES_DB');

    sql = postgres(
      `postgresql://${user}:${password}@${host}:${port}/${dbName}`,
    );
  }

  return sql;
};

export default getDbConnection;
