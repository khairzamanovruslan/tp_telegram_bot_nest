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
  name: string;
  @Column({ type: DataType.TEXT })
  coordinates: string;
}
