import type { Sql } from 'postgres';
import getDbConnection from './sql';
import { DBUnavailableError, isConnectionError } from './errors';

export default async function query<T>(
  operation: (sql: Sql) => PromiseLike<T>,
): Promise<T> {
  try {
    return await operation(getDbConnection());
  } catch (error) {
    if (isConnectionError(error)) {
      throw new DBUnavailableError(error);
    }

    throw error;
  }
}
