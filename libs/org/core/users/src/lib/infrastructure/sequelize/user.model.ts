import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'users', timestamps: true })
export class UserModel extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column({ type: DataType.UUID })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  username!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  firstName?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  lastName?: string;

  @Column({ type: DataType.JSON, allowNull: false, defaultValue: [] })
  roles!: { id: string; name: string; permissions: string[] }[];

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isActive!: boolean;
}
