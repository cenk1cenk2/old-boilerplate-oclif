import { LogLevels } from './logger.constants'

export interface MessageQueue {
  level: LogLevels
  message: any
}
