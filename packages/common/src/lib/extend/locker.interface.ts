export interface LockData<T = Record<string, any> | string | string[]> extends Partial<UnlockData> {
  data: T
  merge?: boolean
}

export interface UnlockData {
  path: string
  enabled?: boolean
  root?: boolean
}

export enum LockerTypes {
  lock,
  local
}
