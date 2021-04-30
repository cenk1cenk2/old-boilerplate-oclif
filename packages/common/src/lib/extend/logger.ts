import chalk from 'chalk'
import config from 'config'
import figures from 'figures'
import { EOL } from 'node:os'
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
  public logcolorAll: boolean

  constructor (module?: string, public options?: winston.LoggerOptions) {
    this.id = module

    try {
      this.loglevel = config.get<LogLevels>('loglevel') ?? LogLevels.module
    } catch {
      this.loglevel = LogLevels.module
    }

    try {
      this.logcolor = config.get<boolean>('logcolor') && (chalk.supportsColor as boolean)
    } catch {
      this.logcolor = chalk.supportsColor as boolean
    }

    try {
      this.logcolorAll = config.get<boolean>('logcolorAll')
    } catch {
      this.logcolorAll = true
    }

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
    const logFormat = format.printf(({ level, message, custom, context, trimEmptyLines }: LoggerFormat) => {
      // parse multi line messages
      let multiLineMessage: string[]

      if (typeof message === 'string') {
        multiLineMessage = message.split(EOL)
      } else if (typeof message === 'object') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        multiLineMessage = message.toString().split(EOL)
      } else {
        multiLineMessage = message
      }

      if (trimEmptyLines) {
        multiLineMessage = multiLineMessage.filter((msg) => msg.trim() !== '' && msg)
      }

      multiLineMessage = multiLineMessage.map((msg) => {
        // format messages
        return this.logColoring({
          level,
          message: msg,
          custom,
          context
        })
      })

      // join back multi line messages
      message = multiLineMessage.join(EOL)

      return message
    })

    const logger = winston.loggers.add(this.id ?? LoggerConstants.DEFAULT_LOGGER, {
      level: this.loglevel || LogLevels.module,
      silent: this.loglevel === LogLevels.silent,
      format: format.combine(format.splat(), format.json({ space: 2 }), format.prettyPrint(), logFormat),
      levels: Logger.levels,
      transports: [
        new transports.Console({
          stderrLevels: [ LogLevels.fail, LogLevels.fatal ]
        })
      ]
    })

    if (process.env.DEBUG === '*') {
      logger.debug(`Initiated logger with level "${this.loglevel}" with id "${this.id ?? LoggerConstants.DEFAULT_LOGGER}".`, { custom: 'logger' })
    }
  }

  private logColoring ({ level, message, custom, context }: LoggerFormat): string {
    let ctx: string
    let icon: string

    // parse context from custom or module
    if (custom) {
      ctx = custom
    } else if (context) {
      ctx = context
    } else if (this.id) {
      ctx = this.id
    }

    // do the coloring
    let coloring = (input: string): string => {
      return input
    }

    switch (level) {
    case LogLevels.fatal:
      coloring = chalk.red
      icon = figures.cross
      break
    case LogLevels.fail:
      coloring = chalk.keyword('orange')
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
      if (this.logcolor === false) {
        return `[${level.toUpperCase()}] ` + (ctx ? `[${ctx.toUpperCase()}] ` : '') + `${message}`
      } else {
        return this.logcolorAll ? coloring(`${icon} ` + (ctx ? `[${ctx.toUpperCase()}] ` : '') + message) : coloring(`${icon} ` + (ctx ? `[${ctx.toUpperCase()}] ` : '')) + message
      }
    }
  }
}
