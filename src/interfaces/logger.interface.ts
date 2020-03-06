import { LeveledLogMethod, Logger as Winston } from 'winston'

import { logLevels } from '@src/lib/extend/logger.constants'

export type ILogger = Winston & Record<keyof typeof logLevels, LeveledLogMethod>
