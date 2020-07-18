import { logLevels } from './logger.constants'

export interface IMessage {
  level: logLevels
  message: any
}