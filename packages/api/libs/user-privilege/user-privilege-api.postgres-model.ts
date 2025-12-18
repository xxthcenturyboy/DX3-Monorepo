import { fn } from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript'

import type { USER_ROLE } from '@dx3/models-shared'

import { USER_PRIVILEGES_POSTGRES_DB_NAME } from './user-privilege-api.consts'
// import { UserPrivilegestMenuType } from './user.types';
// import { parseJson } from '@dx/utils';

@Table({
  indexes: [],
  modelName: USER_PRIVILEGES_POSTGRES_DB_NAME,
  underscored: true,
})
export class UserPrivilegeSetModel extends Model<UserPrivilegeSetModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @Unique
  @Column(DataType.STRING)
  name: keyof typeof USER_ROLE

  @Column(DataType.STRING)
  description: string

  // @Column({ field: 'menus', type: DataType.JSONB })
  // menus: any;

  @Column(DataType.INTEGER)
  order: number

  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @UpdatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date

  // parseMenus(): void {
  //   if (this.menus) {
  //     this.menus = parseJson<UserPrivilegestMenuType[]>(this.menus);
  //   }
  // }
}

export type UserPrivilegeSetModelType = typeof UserPrivilegeSetModel.prototype
