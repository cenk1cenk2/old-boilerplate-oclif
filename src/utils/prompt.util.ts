import { newPrompt, PromptTypes, PromptOptionsType } from 'listr2'

import { Logger } from '@extend/logger'

const logger = new Logger('prompts').log

/** Gets prompt from user. */
export async function promptUser <T extends PromptTypes> (type: T, options: PromptOptionsType<T>): Promise<any>{

  try {
    return newPrompt(type, options).on('cancel', () => {
      logger.fail('Cancelled prompt. Quitting.')
      process.exit(20)
    }).run()

  } catch (e) {
    logger.critical('There was a problem getting the answer of the last question. Quitting.')
    logger.debug(e.trace)
    process.exit(20)

  }

}