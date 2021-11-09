import { LogLevels } from './logger.constants'
import { MessageQueue } from './message.interface'
import { ILogger } from '@interfaces/logger.interface'

export class Message {
  private logger: ILogger
  private messages: MessageQueue[] = []

  constructor (logger: ILogger) {
    this.logger = logger
  }

  public direct (message: MessageQueue['message'], ...args: MessageQueue['args']): void {
    this.messages.push({
      level: LogLevels.direct,
      message,
      args
    })
  }

  public fatal (message: MessageQueue['message'], ...args: MessageQueue['args']): void {
    this.messages.push({
      level: LogLevels.fatal,
      message,
      args
    })
  }

  public fail (message: MessageQueue['message'], ...args: MessageQueue['args']): void {
    this.messages.push({
      level: LogLevels.fail,
      message,
      args
    })
  }

  public warn (message: MessageQueue['message'], ...args: MessageQueue['args']): void {
    this.messages.push({
      level: LogLevels.warn,
      message,
      args
    })
  }

  public success (message: MessageQueue['message'], ...args: MessageQueue['args']): void {
    this.messages.push({
      level: LogLevels.success,
      message,
      args
    })
  }

  public info (message: MessageQueue['message'], ...args: MessageQueue['args']): void {
    this.messages.push({
      level: LogLevels.info,
      message,
      args
    })
  }

  public verbose (message: MessageQueue['message'], ...args: MessageQueue['args']): void {
    this.messages.push({
      level: LogLevels.verbose,
      message,
      args
    })
  }

  public debug (message: MessageQueue['message'], ...args: MessageQueue['args']): void {
    this.messages.push({
      level: LogLevels.debug,
      message,
      args
    })
  }

  /** Pop all the messages waiting in the queue.
   * Which is mostly useful while if you can not reach stdout in a process.
   */
  public pop (): void {
    this.messages.forEach((message) => {
      this.logger[message.level](message.message, ...message.args)
    })

    this.messages = []
  }
}
