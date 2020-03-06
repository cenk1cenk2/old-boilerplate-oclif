import Command from '@oclif/command'
import config from 'config'
import { ListrRendererValue, Manager } from 'listr2'
import path from 'path'

import { IDefaultConfig } from '@src/interfaces/default-config.interface'
import { ILogger } from '@src/interfaces/logger.interface'
import { ObjectLiteral, ObjectLiteralString } from '@src/interfaces/object-literal.interface'
import { Locker } from '@src/lib/extend/locker'
import { Logger } from '@src/lib/extend/logger'
import { checkExists, createDirIfNotExists, readFile, writeFile } from '@src/utils/file-tools.util'

export default class extends Command {
  public logger: ILogger
  public constants: ObjectLiteralString
  public tasks: Manager
  public shortId: string
  public locker: Locker = new Locker(this.id)

  // make run non-abstract for other classes
  public async run (): Promise<void> {
    throw new Error('This is the default output. This should not be here. Please define run() inside the extended command class.')
  }

  // can not override constructor, init function is defined by oclif
  public async init (): Promise<void> {
    // initiate all utilities used
    this.shortId = this.id.split(':').pop()
    this.constants = config.util.toObject()
    this.logger = new Logger(this.shortId).log
    this.config.configDir = path.join(this.config.home, config.get('configDir'))
    // initiate manager
    this.tasks = new Manager({ renderer: this.getListrRenderer() })

    // Greet
    this.logger.module(`Executing ${this.id.toUpperCase()} command.`)
  }

  public async finally (): Promise<void> {
    // run anything in the task queue at the end
    await this.runTasks()

  }

  public async runTasks <Ctx> (): Promise<Ctx> {
    try {
      const ctx = await this.tasks.runAll<Ctx>()

      return ctx

    } catch (e) {
      this.logger.critical(e.message)
      this.logger.debug(e.trace)
      process.exit(127)
    }
  }

  // catch all those errors, not verbose
  public catch (err: Error): Promise<void> {
    if (this.constants.loglevel === 'debug') {
      this.logger.debug(err.stack, { custom: 'crash' })
    } else {
      this.logger.critical(err.message)
    }

    process.exit(127)
  }

  // embed configuration functions
  public async resetConfig (configName: string, defaults: ObjectLiteral = {}): Promise<void> {
    // we expect do config file to be a yaml file
    const ext = path.extname(configName)

    if (!([ '.yaml', '.yml' ].includes(ext))) {
      this.logger.critical('Configuration file must be a yml file!')
      process.exit(40)
    }

    // if local config directory does not exists
    let localConfigPath = this.config.configDir
    await createDirIfNotExists(localConfigPath)

    // create local configuration
    localConfigPath = path.join(localConfigPath, configName)
    await writeFile(localConfigPath, defaults)
  }

  public async getConfig (configName: string, init = false): Promise<IDefaultConfig> {
    const localConfigPath = path.join(this.config.configDir, configName)
    const defaultConfigPath = path.join(this.config.root, 'config', 'defaults', configName)

    // return if local configuration exists
    if (checkExists(localConfigPath)) {
      this.logger.debug('Found local configuration file.')

      return {
        config: await readFile(localConfigPath), local: true, path: localConfigPath
      }

    } else {
      // read default module configuration
      const defaultConfig = await readFile(defaultConfigPath)
      this.logger.debug('No local configuration file found. Using the defaults.')

      // initiate a lock configuration if specified from the default values
      if (init) {
        this.resetConfig(localConfigPath, defaultConfig)
      }

      // return module default configuration
      return { config: defaultConfig, local: false }
    }
  }

  private getListrRenderer (): ListrRendererValue<any> {
    if (this.constants?.loglevel === 'silent') {
      return 'silent'
    } else if (this.constants?.loglevel === 'debug') {
      return 'verbose'
    } else {
      return 'default'
    }
  }
}
