import { Hook } from '@oclif/config'
import os from 'os'
import { createInterface } from 'readline'

import { Logger } from '@extend/logger'

export const prerunHook: Hook<'prerun'> = async () => {
  // graceful terminate
  if (os.platform() === 'win32') {
    createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('SIGINT', () => {
      process.kill(process.pid, 'SIGINT')
    })
  }

  process.on('SIGINT', () => {
    const logger = new Logger().log

    // show that we have understood that
    logger.fail('Caught terminate signal.', { custom: 'exit' })

    process.exit(127)
  })
}
