import { ObjectLiteral } from '@src/interfaces/object-literal.interface'

export interface IDefaultConfig {
  local: boolean
  config: ObjectLiteral
  path?: string
}
