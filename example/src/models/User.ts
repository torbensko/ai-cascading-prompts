export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) { }

  static fromJson(json: any): User {
    return new User(
      json.id,
      json.name,
      json.email,
      json.password,
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}