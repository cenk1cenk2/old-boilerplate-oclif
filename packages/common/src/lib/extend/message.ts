import { LogLevels } from './logger.constants'
import { MessageQueue } from './message.interface'
import { ILogger } from '@interfaces/logger.interface'

export class Message {
  private logger: ILogger
  private messages: MessageQueue[] = []

  constructor (logger: ILogger) {
    this.logger = logger
  }

  public direct (message: any): void {
    this.messages.push({ level: LogLevels.direct, message })
  }

  public critical (message: any): void {
    this.messages.push({ level: LogLevels.critical, message })
  }

  public fail (message: any): void {
    this.messages.push({ level: LogLevels.fail, message })
  }

  public warn (message: any): void {
    this.messages.push({ level: LogLevels.warn, message })
  }

  public success (message: any): void {
    this.messages.push({ level: LogLevels.success, message })
  }

  public info (message: any): void {
    this.messages.push({ level: LogLevels.info, message })
  }

  public debug (message: any): void {
    this.messages.push({ level: LogLevels.debug, message })
  }

  public pop (): void {
    this.messages.forEach((message) => {
      this.logger[message.level](message.message)
    })

    this.messages = []
  }
}
