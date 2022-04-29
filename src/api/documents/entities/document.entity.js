export class Document {
  constructor(
    id,
    userId,
    title,
    content,
    status,
    participants,
    createdAt,
    updatedAt
  ) {
    this.id = id
    this.userId = userId
    this.title = title
    this.content = content
    this.status = status
    this.participants = participants
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromJson(json) {
    if (!json) return null;
    return new Document(
      json.id,
      json.user_id,
      json.title,
      json.content,
      json.status,
      null,
      new Date(json.created_at),
      new Date(json.updated_at),
    );
  }

  toJson() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      content: this.content,
      status: this.status,
      participants: this.participants,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}