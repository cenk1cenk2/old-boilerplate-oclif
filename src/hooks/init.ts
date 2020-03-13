import { Hook } from '@oclif/config'
import config from 'config'

import { DockerCommand } from '@commands/docker'
import { GitMergeCommand } from '@commands/git/merge'
import { Logger } from '@extend/logger'
import { getLogo } from '@templates/logo.template'

const hook: Hook<'init'> = async (opts): Promise<void> => {
  // initiate logger
  const logger = new Logger(opts.config.name).log

  // print logo
  if (config.get('loglevel') !== 'silent') {
    logger.direct(getLogo(opts.config.version))
  }

  // run default command
  if (!opts.id) {
    try {
      logger.warn('No specific task is defined running the default task which is to git-merge and create docker-compose file.', { custom: 'brownie' })

      await GitMergeCommand.run(opts.argv)
      await DockerCommand.run(opts.argv)
    } finally {
      process.exit(0)
    }
  }
}

export default hook
