export interface LockData extends Partial<UnlockData> {
  data: Record<string, any> | string | string[]
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