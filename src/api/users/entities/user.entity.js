export class User {
  constructor(id, email, name, password, createdAt, updatedAt) {
    this.id = id
    this.email = email
    this.name = name
    this.password = password
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromJson(json) {
    if (!json) return null;
    return new User(
      json.id,
      json.email,
      json.name,
      json.password,
      new Date(json.created_at),
      new Date(json.updated_at),
    );
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}