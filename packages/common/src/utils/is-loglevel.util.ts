import config from 'config'

import { LogLevels } from '@lib/extend/logger.constants'

export function isDebug (): boolean {
  return config.get('loglevel') === LogLevels.debug
}

export function isVerbose (): boolean {
  return config.get('loglevel') === LogLevels.verbose
}

export function isSilent (): boolean {
  return config.get('loglevel') === LogLevels.silent
}
