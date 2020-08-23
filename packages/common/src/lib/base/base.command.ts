import Command from '@oclif/command'
import config from 'config'
import { Manager } from 'listr2'
import path from 'path'

import { Locker } from '@extend/locker'
import { Logger } from '@extend/logger'
import { LogLevels } from '@extend/logger.constants'
import { Message } from '@extend/message'
import { DefaultConfig } from '@interfaces/default-config.interface'
import { ILogger } from '@interfaces/logger.interface'
import { removeObjectOtherKeys } from '@src/utils/custom.util'
import { yamlExtensions } from '@utils/file-tools.constants'
import { checkExists, createDirIfNotExists, readFile, writeFile } from '@utils/file-tools.util'

export class BaseCommand extends Command {
  public logger: ILogger
  public message: Message
  public constants: Record<string, any>
  public tasks: Manager<any, 'default'>
  public shortId: string
  public locker: Locker = new Locker(this.id)

  /** Every command needs to implement run for running the command itself. */
  // make run non-abstract for other classes
  public async run (): Promise<void> {
    throw new Error('This is the default output. This should not be here. Please define run() inside the extended command class.')
  }

  /** Initial functions / constructor */
  // can not override constructor, init function is defined by oclif
  public async init (): Promise<void> {
    // initiate all utilities used
    this.shortId = this.id.split(':').pop()
    this.constants = config.util.toObject()

    this.logger = new Logger(this.id).log
    this.message = new Message(this.logger)

    this.config.configDir = path.join(this.config.home, config.get('configDir'))
    // initiate manager
    this.tasks = new Manager({
      rendererFallback: this.constants?.loglevel === LogLevels.debug,
      rendererSilent: this.constants?.loglevel === LogLevels.silent,
      nonTTYRendererOptions: { logEmptyTitle: false, logTitleChange: false }
    })
  }

  /** Tasks to run before end of the command. */
  public async finally (): Promise<void> {
    // run anything in the task queue at the end
    await this.runTasks()

    // pop all messages in the queue
    this.message.pop()
  }

  /** Run all tasks from task manager. */
  public async runTasks<Ctx>(): Promise<Ctx> {
    try {
      const ctx = await this.tasks.runAll<Ctx>()

      return ctx
    } catch (e) {
      this.logger.fatal(e.message)
      this.logger.debug(e.stack)
      process.exit(126)
    }
  }

  /** Catch any error occured during command. */
  // catch all those errors, not verbose
  public catch (e: Error): Promise<void> {
    this.logger.fatal(e.message)
    this.logger.debug(e.stack, { custom: 'crash' })

    process.exit(126)
  }

  /**
   * Clean up unnecassary flags which might throw an error when passing them between commands, say no to parsing errors!
   * The function will find the second arguments in the first one and match them.abs
   * But the first one must be a valid set arguments because it will get parsed from the command.
   */
  public cleanUpFlags (base: Record<string, any> | typeof Command, from: Record<string, any> | typeof Command): string[] {
    if (typeof base === typeof Command) {
      base = this.parse(base).flags
    }
    if (typeof from === typeof Command) {
      from = from.flags
    }

    const strippedFlags = removeObjectOtherKeys(base, from)

    const argv: string[] = []

    Object.entries(strippedFlags).forEach(([ key, value ]) => {
      argv.push(`--${key}`)

      // it goes crazy when setting the argument boolean, will throw a parsing error
      if (typeof value !== 'boolean' && typeof value !== 'undefined') {
        argv.push(value as string)
      }
    })

    return argv
  }

  /** To reset local/default configuration directly from the command itself.
   * Mainly used for initiating local config from getConfig. */
  public async resetConfig (configName: string, defaults: Record<string, any> = {}): Promise<void> {
    // we expect do config file to be a yaml file
    const ext = path.extname(configName)

    if (!yamlExtensions.includes(ext)) {
      this.logger.fatal('Configuration file must be a yml file!')
      process.exit(20)
    }

    // if local config directory does not exists
    let localConfigPath = this.config.configDir
    await createDirIfNotExists(localConfigPath)

    // create local configuration
    localConfigPath = path.join(localConfigPath, configName)
    await writeFile(localConfigPath, defaults)
  }

  /** To get local/default configuration directly from the command itself. */
  public async getConfig (configName: string, init = false): Promise<DefaultConfig> {
    const localConfigPath = path.join(this.config.configDir, configName)
    const defaultConfigPath = path.join(this.config.root, 'config', 'defaults', configName)

    // return if local configuration exists
    if (checkExists(localConfigPath)) {
      const localConfig = await readFile(localConfigPath)
      this.logger.verbose('Found local configuration file.')

      return {
        config: localConfig,
        local: true,
        path: localConfigPath
      }
    } else if (checkExists(defaultConfigPath)) {
      // read default module configuration
      const defaultConfig = await readFile(defaultConfigPath)
      this.logger.verbose('No local configuration file found. Using the defaults.')

      // initiate a lock configuration if specified from the default values
      if (init) {
        await this.resetConfig(configName, defaultConfig)
      }

      // return module default configuration
      return { config: defaultConfig, local: false }
    } else {
      this.logger.verbose('Neither local nor default configuration exists. Initiating a new local one.')

      await this.resetConfig(configName, {})

      return { config: {}, local: true }
    }
  }
}
