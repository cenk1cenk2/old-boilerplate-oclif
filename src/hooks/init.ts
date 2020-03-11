import { Hook } from '@oclif/config'
import config from 'config'

import { Logger } from '@extend/logger'
import { logo } from '@templates/logo.template'

const hook: Hook<'init'> = async (opts): Promise<void> => {
  // initiate logger
  const logger = new Logger(opts.config.name).log

  // print logo
  if (config.get('loglevel') !== 'silent') {
    logger.direct(logo(opts.config.version))
  }

  // run default command
  if (!opts.id) {
    try {
      logger.warn('No specific task is defined running the default task.', { custom: config.get('cli') })
      // DEFAULT COMMAND CAN GO HERE
      //  IMPORT IT AND RUN OR RUN BY OCLIF

    } finally {
      process.exit(0)

    }
  }
}

export default hook
