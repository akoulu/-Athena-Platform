import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';

@Table({ tableName: 'blacklisted_tokens', timestamps: true })
export class BlacklistedTokenModel extends Model {
  @Index
  @Column({ type: DataType.STRING, allowNull: false })
  jti!: string; // token id if you use it; fallback to token hash

  @Column({ type: DataType.STRING, allowNull: false })
  tokenHash!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt!: Date;
}
