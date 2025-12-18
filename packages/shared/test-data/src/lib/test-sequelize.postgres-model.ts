import { fn } from 'sequelize'
import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'

@Table({
  indexes: [],
  modelName: 'testing-entity',
  underscored: true,
})
export class TestingEntityModel extends Model<TestingEntityModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @Column({ field: 'test_value', type: DataType.STRING })
  hashword: string
}

export type TestingEntityModelType = typeof TestingEntityModel.prototype
