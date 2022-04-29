import { db } from '../../lib/database.js';
import { Participant } from './entities/participant.entity.js';

export class ParticipantRepository {
  tableName = 'participants';

  findById(id) {
    const raw = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(id);
    return Participant.fromJson(raw);
  }

  findByDocumentIdAndEmail(documentId, email) {
    const raw = db
      .prepare(
        `SELECT * FROM ${this.tableName} WHERE document_id = ? and email = ?`,
      )
      .get(documentId, email);

    return Participant.fromJson(raw);
  }
}
