export interface ILockData extends Partial<IUnlockData> {
  data: Record<string, any> | string | string[]
  merge?: boolean
}

export interface IUnlockData {
  path: string
  enabled?: boolean
  root?: boolean
}
