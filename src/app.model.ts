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
  @Column({ type: DataType.STRING })
  name: string;
  @Column({ type: DataType.STRING })
  coordinateFirst: string;
  @Column({ type: DataType.STRING })
  coordinateSecond: string;
  @Column({ type: DataType.STRING })
  coordinateFull: string;
  @Column({ type: DataType.STRING })
  link: string;
}
