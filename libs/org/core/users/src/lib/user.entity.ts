import { User, Role } from '@org/types';

export class UserEntity implements User {
  id!: string;
  email!: string;
  username!: string;
  password!: string;
  firstName?: string;
  lastName?: string;
  roles!: Role[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
    this.id = partial.id || this.generateId();
    this.isActive = partial.isActive ?? true;
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
    this.roles = partial.roles || [];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON(): Omit<UserEntity, 'password' | 'toJSON'> {
    const { password: _password, toJSON: _toJSON, ...user } = this;
    return user as Omit<UserEntity, 'password' | 'toJSON'>;
  }
}
