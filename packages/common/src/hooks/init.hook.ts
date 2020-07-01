import { Hook } from '@oclif/config'
import config from 'config'

import { Logger } from '@extend/logger'

export function generateInitHook (options: { defaultTask?: () => Promise<void>, logo: (version: string) => string }): Hook<'init'> {
  const InitHook: Hook<'init'> = async (opts): Promise<void> => {
    // initiate logger
    const logger = Logger.prototype.getInstance(opts.config.name)

    // print logo
    if (config.get('loglevel') !== 'silent') {
      logger.direct(options.logo(opts.config.version))
    }

    // run default command
    if (options?.defaultTask && !opts.id) {
      try {
        await options.defaultTask()
      } finally {
        process.exit(0)
      }
    }
  }

  return InitHook
}
