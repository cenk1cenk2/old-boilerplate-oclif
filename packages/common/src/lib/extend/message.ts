import { logLevels } from './logger.constants'
import { IMessage } from './message.interface'
import { ILogger } from '@interfaces/logger.interface'

export class Message {
  private logger: ILogger
  private messages: IMessage[] = []

  constructor (logger: ILogger) {
    this.logger = logger
  }

  public direct (message: any): void {
    this.messages.push({ level: logLevels.direct, message })
  }

  public critical (message: any): void {
    this.messages.push({ level: logLevels.critical, message })
  }

  public fail (message: any): void {
    this.messages.push({ level: logLevels.fail, message })
  }

  public warn (message: any): void {
    this.messages.push({ level: logLevels.warn, message })
  }

  public success (message: any): void {
    this.messages.push({ level: logLevels.success, message })
  }

  public info (message: any): void {
    this.messages.push({ level: logLevels.info, message })
  }

  public debug (message: any): void {
    this.messages.push({ level: logLevels.debug, message })
  }

  public pop (): void {
    this.messages.forEach((message) => {
      this.logger[message.level](message.message)
    })

    this.messages = []
  }
}