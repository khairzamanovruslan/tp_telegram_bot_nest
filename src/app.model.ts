import { Model, Table, Column, DataType } from 'sequelize-typescript';

interface SubstationAttrs {
  readonly name: string;
  readonly coordinates: string;
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
  @Column({ type: DataType.TEXT })
  fullName: string;
  @Column({ type: DataType.TEXT })
  name: string;
  @Column({ type: DataType.TEXT })
  coordinateFirst: string;
  @Column({ type: DataType.TEXT })
  coordinateSecond: string;
  @Column({ type: DataType.TEXT })
  coordinateFull: string;
  @Column({ type: DataType.TEXT })
  link: string;
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
}
