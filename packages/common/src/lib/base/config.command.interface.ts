export interface ConfigRemove<T> {
  keys: string[]
  removeFunction: (config: T, userInput: string[]) => Promise<T>
}
