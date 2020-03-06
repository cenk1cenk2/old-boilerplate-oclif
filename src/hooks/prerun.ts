import { Hook } from '@oclif/config'
import os from 'os'
import { createInterface } from 'readline'

import { Logger } from '@src/lib/extend/logger'

const hook: Hook<'prerun'> = async (opts) => {
  const logger = new Logger(opts.config.name).log

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
    logger.fail('Caught terminate signal.', { custom: 'exit' })
    process.exit(127)
  })
}

export default hook
