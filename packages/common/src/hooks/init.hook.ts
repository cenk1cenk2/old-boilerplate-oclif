import { Hook } from '@oclif/config'
import { HookKeyOrOptions } from '@oclif/config/lib/hooks'
import config from 'config'

import { Logger } from '@extend/logger'

export function generateInitHook (options: {
  defaultTask?: (opts?: HookKeyOrOptions<any>) => Promise<void>
  preliminaryTask?: (opts?: HookKeyOrOptions<any>) => Promise<void>
  logo: (version?: string) => string
}): Hook<'init'> {
  const initHook: Hook<'init'> = async (opts): Promise<void> => {
    // print logo
    if (config.get('loglevel') !== 'silent') {
      // initiate logger
      const logger = new Logger().log

      logger.direct(options.logo(opts.config.version))
    }

    if (options.preliminaryTask) {
      await options.preliminaryTask(opts)
    }

    // run default command
    if (options?.defaultTask && !opts.id) {
      try {
        await options.defaultTask(opts)
      } finally {
        process.exit(0)
      }
    }
  }

  return initHook
}
