import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';

@Table({ tableName: 'refresh_tokens', timestamps: true })
export class RefreshTokenModel extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  userId!: string;

  @Index
  @Column({ type: DataType.STRING, allowNull: false })
  familyId!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  tokenHash!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt!: Date;
}
