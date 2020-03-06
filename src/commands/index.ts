import { flags } from '@oclif/command'

import Command from '@src/lib/base/base.command'

export default class Index extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    force: flags.boolean({char: 'f'})
  }

  static args = [ {name: 'file'} ]

  async run (): Promise<void> {
    // const {args, flags} = this.parse(Index)

    this.logger.module('Hello all.')

  }
}
