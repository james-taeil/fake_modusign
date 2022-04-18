import { db } from '../../lib/database.js';
import { User } from './entities/user.entity.js';

export class UserRepository {
  tableName = 'users';

  findById(id) {
    const raw = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(id);
    return User.fromJson(raw);
  }

  findByEmail(email) {
    const raw = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE email = ?`)
      .get(email);
    return User.fromJson(raw);
  }

  countByEmail(email) {
    return db
      .prepare(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = ?`
      )
      .get(email);
  }

  create(raw) {
    return db
      .prepare(
        [
          'INSERT INTO',
          this.tableName,
          '(id, email, name, password, created_at, updated_at)',
          'VALUES',
          '($id, $email, $name, $password, $create_at, $updated_at)',
        ].join(' '),
      )
      .run(raw);
  }
}