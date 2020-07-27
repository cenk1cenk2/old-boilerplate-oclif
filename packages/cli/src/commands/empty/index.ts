import { BaseCommand } from '@cenk1cenk2/boilerplate-oclif'
import { flags } from '@oclif/command'

export default class Empty extends BaseCommand {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    force: flags.boolean({ char: 'f' })
  }

  static args = [ { name: 'file' } ]

  async run (): Promise<void> {
    // const {args, flags} = this.parse(Index)

    this.logger.module('Hello all.')
    this.logger.debug('secret debug message')
  }
}
