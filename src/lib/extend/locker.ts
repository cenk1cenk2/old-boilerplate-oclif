import config from 'config'
import objectPath from 'object-path'

import { ILockData, IUnlockData } from './locker.interface'
import { ILockFile } from '@src/interfaces/lock-file.interface'
import { ILogger } from '@src/interfaces/logger.interface'
import { ObjectLiteral } from '@src/interfaces/object-literal.interface'
import { Logger } from '@src/lib/extend/logger'
import { mergeObjects } from '@src/utils/custom.util'
import { checkExists, readFile, writeFile } from '@src/utils/file-tools.util'

export class Locker {
  private toLock: ILockData[] = []
  private toUnlock: IUnlockData[] = []
  private logger: ILogger

  constructor (private module: string, private type: 'lock' | 'local' = 'lock') {
    this.module = module
    this.logger = new Logger(this.constructor.name).log
  }

  public async lock (data: ILockData[]): Promise<void> {
    const currentLock = (await this.getLockFile()) || {}

    await Promise.all(data.map(async (lock) => {
      const lockPath = lock?.path ? `${this.module}.${lock.path}` : this.module

      // enabled flag for not if checkking everytime
      if (lock?.enabled === false) {
        return
      }
      // check if data is empty
      if (!lock?.data || (Array.isArray(lock?.data) && lock.data.length === 0) || (Object?.keys?.length === 0)) {
        return
      }
      // set lock
      if (lock?.merge) {
        let parsedLockData: [] | ObjectLiteral

        // check if array else merge as object
        if (Array.isArray(lock?.data)) {
          const arrayLock = objectPath.get(currentLock, lockPath) || []
          parsedLockData = [ ...arrayLock, ...lock.data ]
        } else {
          parsedLockData = mergeObjects(objectPath.get(currentLock, lockPath) || {}, lock.data)
        }

        // set lock data
        objectPath.set(currentLock, lockPath, parsedLockData)
        this.logger.debug(`Merge lock: "${lockPath}"`)
      } else {
        // dont merge directly set the data
        objectPath.set(currentLock, lockPath, lock.data)
        this.logger.debug(`Override lock: "${lockPath}"`)
      }
    }))

    // write data
    await this.writeLockFile(currentLock)
  }

  public add (data: ILockData | ILockData[]): void {
    // @review: array spreading
    // TODO: does array spreading work with string, i could not manage it
    this.toLock = this.toLock.concat(data)
  }

  public addUnlock (data: IUnlockData | IUnlockData[]): void {
    this.toUnlock = this.toUnlock.concat(data)
  }

  public async lockAll (): Promise<void> {
    await this.lock(this.toLock)
    this.toLock = []
  }

  public async unlock (data?: IUnlockData[]): Promise<void> {
    // get lock file
    const currentLock = await this.getLockFile()

    // write data
    if (!currentLock) {
      this.logger.debug('Lock file not found. Nothing to unlock.')
      return
    }

    // option to delete all, or specific locks
    if (data && Object.keys(data).length > 0) {
      await Promise.all(data.map(async (lock) => {
        const lockPath = `${this.module}.${lock.path}`

        // enabled flag for not if checkking everytime
        if (lock?.enabled === false) {
          return
        }

        // set unlock
        objectPath.del(currentLock, lockPath)
        this.logger.debug(`Unlocked: ${lockPath}`)
      }))
    } else {
      objectPath.del(currentLock, this.module)
    }

    // write data
    await this.writeLockFile(currentLock)
  }

  public async unlockAll (): Promise<void> {
    await this.unlock(this.toUnlock)
    this.toUnlock = []
  }

  public getLockPath (): string {
    // maybe will use it in multiple places, so better keep it here
    if (this.type === 'lock') {
      return config.get('lock')
    } else if (this.type === 'local') {
      return config.get('localConfig')
    } else {
      this.logger.critical('Lock type is not correct. This should not happenned.')
      process.exit(127)
    }
  }

  public async getLockFile (): Promise<ILockFile> {
    const lockPath = this.getLockPath()

    // if not exists
    if (checkExists(lockPath)) {
      return readFile(lockPath)
    }
  }

  public async writeLockFile (data: any): Promise<void> {
    // get the lock file path
    const lockFile = this.getLockPath()

    // write data
    await writeFile(lockFile, data)
  }
}
