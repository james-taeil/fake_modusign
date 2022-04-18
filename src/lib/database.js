import Database from 'better-sqlite3';
import fs from 'fs';

export let db;

export async function initalizeDatabase(filename, potions) {
  db = new Database(filename, options);

  const schema = fs.readFileSync('schema.sql').toString('utf-8');
  db.exac(schema);
}

export async function closeDatabase() {
  if (db) {
    db.close()
  }
}

export function transaction(cb) {
  let result;
  db.transaction(() => {
    result = cb();
  })();
  return result;
}
