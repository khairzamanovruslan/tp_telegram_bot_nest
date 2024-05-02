import { Model, Table, Column, DataType } from 'sequelize-typescript';

interface SubstationAttrs {
  readonly id: number;
  readonly name: string;
  readonly latitude: string;
  readonly longitude: string;
}

@Table({ tableName: 'substation', timestamps: false })
export class Substation extends Model<Substation, SubstationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;
  @Column({ type: DataType.TEXT, unique: true })
  name: string;
  @Column({ type: DataType.TEXT })
  latitude: string;
  @Column({ type: DataType.TEXT })
  longitude: string;
}

interface UsersAttrs {
  readonly id_tg: string;
  readonly access_bot: boolean;
}

@Table({ tableName: 'users_tg', timestamps: false })
export class Users extends Model<Users, UsersAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;
  @Column({ type: DataType.TEXT, unique: true })
  id_tg: string;
  @Column({ type: DataType.TEXT })
  full_name: string;
  @Column({ type: DataType.BOOLEAN })
  access_bot: boolean;
}
