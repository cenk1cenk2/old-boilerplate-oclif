export interface ConfigRemove<T> {
  keys: string[]
  removeFunction: (config: T, userInput: string[]) => Promise<T>
}

export enum ConfigTypes {
  general,
  local,
  localRoot
}

export enum ConfigCommandChoices {
  show = 'Show',
  add = 'Add',
  remove = 'Remove',
  edit = 'Edit',
  init = 'Init',
  import = 'Import',
  delete = 'Delete'
}