import { Model, Table, Column, DataType } from 'sequelize-typescript';

interface SubstationAttrs {
  readonly id: number;
  readonly name: string;
  readonly latitude: string;
  readonly longitude: string;
}

@Table({ tableName: 'substation' })
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
  readonly username_tg: string;
}

@Table({ tableName: 'users' })
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
  @Column({ type: DataType.TEXT, unique: true })
  username_tg: string;
  @Column({ type: DataType.TEXT })
  first_name_tg: string;
  @Column({ type: DataType.TEXT })
  last_name_tg: string;
}
