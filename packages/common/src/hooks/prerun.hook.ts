import { Hook } from '@oclif/config'
import os from 'os'
import { createInterface } from 'readline'

import { Logger } from '@extend/logger'

export function prerunHookWithOptions (options?: { registerExitListeners?: boolean }): Hook<'prerun'> {
  return async (): Promise<void> => {
    // graceful terminate
    if (os.platform() === 'win32') {
      createInterface({
        input: process.stdin,
        output: process.stdout
      }).on('SIGINT', () => {
        process.kill(process.pid, 'SIGINT')
      })
    }

    if (options?.registerExitListeners !== false) {
      process.on('SIGINT', () => {
        const logger = new Logger().log

        // show that we have understood that
        logger.fatal('Caught terminate signal.', { custom: 'exit' })

        process.exit(127)
      })
    }
  }
}

/** @deprecated Legacy version to not break compatibility */
export const prerunHook: Hook<'prerun'> = prerunHookWithOptions({ registerExitListeners: true })
