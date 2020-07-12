export interface IConfigRemove <T> {
  keys: string[]
  removeFunction: (config: T, userInput: string[]) => Promise<T>
}