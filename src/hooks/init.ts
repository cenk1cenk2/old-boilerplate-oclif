import { Hook } from '@oclif/config'
import config from 'config'

import { Logger } from '@src/lib/extend/logger'
import { logo } from '@src/templates/logo.template'

const hook: Hook<'init'> = async (opts): Promise<void> => {
  // initiate logger
  const logger = new Logger(opts.config.name).log
  // print logo

  // TODO: why not using logger? ... maybe u can add there a forwarder to just console.log (without winston) ... then we have all output functions in one class
  if (config.get('loglevel') !== 'silent') {
    // eslint-disable-next-line no-console
    console.log(logo(opts.config.version))
  }

  // run default command
  if (!opts.id) {
    try {
      logger.warn('No specific task is defined running the default task.', { custom: config.get('cli') })
      // DEFAULT COMMAND CAN GO HERE
    } finally {
      process.exit(0)
    }
  }
}

export default hook
