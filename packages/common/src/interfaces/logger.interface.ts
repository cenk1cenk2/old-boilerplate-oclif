import { LeveledLogMethod, Logger as Winston } from 'winston'

import { LogLevels } from '@lib/extend/logger.constants'

export type ILogger = Winston & Record<keyof typeof LogLevels, LeveledLogMethod>
