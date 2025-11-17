import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';

@Table({ tableName: 'reset_tokens', timestamps: true })
export class ResetTokenModel extends Model {
  @Index
  @Column({ type: DataType.STRING, allowNull: false })
  userId!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  tokenHash!: string;

  @Index
  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt!: Date;
}
