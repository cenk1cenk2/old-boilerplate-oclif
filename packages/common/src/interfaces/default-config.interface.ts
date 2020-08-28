export interface DefaultConfig<T = Record<string, any> | any[]> {
  local: boolean
  config: T
  path?: string
}
