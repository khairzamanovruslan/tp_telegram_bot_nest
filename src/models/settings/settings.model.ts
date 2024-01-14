import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface SettingsAttrs {
  readonly passwordValue: string;
}

@Table({ tableName: 'settings' })
export class Settings extends Model<Settings, SettingsAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.TEXT })
  passwordValue: string;
}
