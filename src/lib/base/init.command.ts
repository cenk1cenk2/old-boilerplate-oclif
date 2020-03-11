import Command from './base.command'
import { checkExists, writeFile } from '@utils/file-tools.util'

export default abstract class extends Command {
  abstract baseFile: string

  abstract append: boolean

  async run (): Promise<void> {
    const { flags } = this.parse(Command)

    // create init docker compose file
    this.tasks.add([
      {
        title: 'Clearing out comments.',
        enabled: (): boolean => flags['no-comment'],
        task: (ctx, task): void => {
          this.baseFile = this.removeComments(this.baseFile)
          task.title = 'No comments will be added to generated file.'
        }
      },
      {
        title: `Writing "${flags.output}".`,
        task: async (ctx, task): Promise<void> => {
          try {
            if (this?.append && !checkExists(flags.output)) {
              this.append = false
            }

            await writeFile(flags.output, this.baseFile, this?.append, false)
            task.title = `Generated "${flags.output}".`
          } catch (e) {
            throw new Error(e)
          }
        }
      }
    ])
  }

  private removeComments (data: string): string {
    let parsedData = data.split('\n')
    parsedData = parsedData.map((line) => {
      return !line.match(/.*#.*/) ? line : null
    })

    parsedData = parsedData.filter((item) => item !== null)

    data = parsedData.join('\n')
    return data
  }
}
