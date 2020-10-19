import chalk from 'chalk'
import config from 'config'
import figures from 'figures'
import winston, { format, transports } from 'winston'

import { LoggerConstants, LogLevels } from './logger.constants'
import { LoggerFormat } from './logger.interface'
import { ILogger } from '@interfaces/logger.interface'

export class Logger {
  static readonly levels = {
    [LogLevels.silent]: 0,
    [LogLevels.direct]: 1,
    [LogLevels.fatal]: 1,
    [LogLevels.fail]: 2,
    [LogLevels.warn]: 3,
    [LogLevels.success]: 4,
    [LogLevels.info]: 5,
    [LogLevels.module]: 6,
    [LogLevels.verbose]: 7,
    [LogLevels.debug]: 8
  }

  public log: ILogger
  public id?: string
  public loglevel: LogLevels
  public logcolor: boolean

  constructor (module?: string, public options?: winston.LoggerOptions) {
    this.id = module
    this.loglevel = config.get<LogLevels>('loglevel')
    this.logcolor = config.get<boolean>('logcolor')
    this.log = this.getInstance()
  }

  public getInstance (): ILogger {
    if (this.id ? !winston.loggers.has(this.id) : !winston.loggers.has(LoggerConstants.DEFAULT_LOGGER)) {
      this.initiateLogger()

    }

    if (this.id) {
      return winston.loggers.get(this.id) as ILogger
    } else {
      return winston.loggers.get(LoggerConstants.DEFAULT_LOGGER) as ILogger
    }
  }

  private initiateLogger (): void {
    const logFormat = format.printf(({ level, message, custom }: LoggerFormat) => {
      // parse multi line messages
      try {
        let multiLineMessage = message.split('\n')
        multiLineMessage = multiLineMessage.map((msg) => {
          if (msg.trim() !== '') {
            // format messages
            return this.logColoring({
              level,
              message: msg,
              custom
            })
          }
        })
        // join back multi line messages
        message = multiLineMessage.join('\n')
        // eslint-disable-next-line no-empty
      } catch {}
      return message
    })

    const logger = winston.loggers.add(this.id ?? LoggerConstants.DEFAULT_LOGGER, {
      level: this.loglevel || LogLevels.module,
      silent: this.loglevel === LogLevels.silent,
      format: format.combine(format.splat(), format.json({ space: 2 }), format.prettyPrint(), logFormat),
      levels: Logger.levels,
      transports: [ new transports.Console({
        stderrLevels: [ LogLevels.fail, LogLevels.fatal ]
      }) ]
    })

    if (process.env.DEBUG === '*') {
      logger.debug(`Initiated logger with level "${this.loglevel}" with id "${this.id ?? LoggerConstants.DEFAULT_LOGGER}".`, { custom: 'logger' })
    }
  }

  private logColoring ({ level, message, custom }: LoggerFormat): string {
    let context: string
    let icon: string

    // parse context from custom or module
    if (custom) {
      context = custom
    } else if (this.id) {
      context = this.id
    }

    // do the coloring
    let coloring = (input: string): string => {
      return input
    }

    switch (level) {
    case LogLevels.fatal:
      coloring = chalk.bgRed.white
      icon = figures.cross
      break
    case LogLevels.fail:
      coloring = chalk.red
      icon = figures.cross
      break
    case LogLevels.warn:
      coloring = chalk.yellow
      icon = figures.warning
      break
    case LogLevels.success:
      coloring = chalk.green
      icon = figures.tick
      break
    case LogLevels.info:
      icon = figures.pointerSmall
      break
    case LogLevels.module:
      coloring = chalk.green
      icon = figures.pointer
      break
    case LogLevels.verbose:
      coloring = chalk.dim
      icon = figures.info
      break
    case LogLevels.debug:
      coloring = chalk.cyan
      icon = figures.info
      break
    default:
      break
    }

    if (level === LogLevels.direct) {
      return message
    } else {
      const parsedMessage = `[${context.toUpperCase()}] ${message}`

      if (this.logcolor === false) {
        return `[${level.toUpperCase()}] ${parsedMessage}`
      } else {
        return coloring(`${icon} ${parsedMessage}`)
      }
    }
  }
}
