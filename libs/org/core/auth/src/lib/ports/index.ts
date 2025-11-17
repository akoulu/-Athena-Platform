export interface UserRepositoryPort {
  findById(id: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  create(data: any): Promise<any>;
}

export interface RefreshTokenStorePort {
  save(userId: string, tokenHash: string, familyId: string): Promise<void>;
  match(userId: string, rawToken: string): Promise<boolean>;
  revokeFamily(familyId: string): Promise<void>;
}

export interface PasswordResetStorePort {
  save(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  consume(userId: string, rawToken: string): Promise<boolean>;
}
