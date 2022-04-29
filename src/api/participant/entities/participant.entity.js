export class Participant {
  constructor(
    id,
    documentId,
    name,
    email,
    status,
    signature,
    createdAt,
    updatedAt,
  ) {
    this.id = id
    this.documentId = documentId
    this.name = name
    this.email = email
    this.status = status
    this.signature = signature
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromJson(json) {
    if (!json) return null;
    return new Participant(
      json.id,
      json.document_id,
      json.name,
      json.email,
      json.status,
      json.signature,
      new Date(json.created_at),
      new Date(json.updated_at),
    );
  }

  toJson(){
    return {
      id: this.id,
      documentId: this.documentId,
      email: this.email,
      name: this.name,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
