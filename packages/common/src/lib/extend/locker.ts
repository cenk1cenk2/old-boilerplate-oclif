import config from 'config'
import objectPath from 'object-path-immutable'

import { LockData, UnlockData, LockerTypes } from './locker.interface'
import { Logger } from '@extend/logger'
import { ILogger } from '@interfaces/logger.interface'
import { mergeObjects } from '@utils/custom.util'
import { checkExists, readFile, writeFile } from '@utils/file-tools.util'

export class Locker {
  private toLock: LockData[] = []
  private toUnlock: UnlockData[] = []
  private logger: ILogger

  constructor (private module: string, private type: LockerTypes = LockerTypes.lock, private lockFilePath?: string) {
    this.module = module
    this.logger = new Logger(this.constructor.name).log
  }

  public setRoot (root: string): void {
    this.module = root
  }

  public async lock<T = Record<string, any> | string | string[]>(data: LockData<T> | LockData<T>[]): Promise<void> {
    // cast to array
    if (!Array.isArray(data)) {
      data = [ data ]
    }

    let currentLock = await this.getLockFile() || {}

    await Promise.all(
      data.map(async (lock) => {
        let lockPath: string

        // you can designate using the module from root instead of this.module
        if (lock?.root !== true) {
          lockPath = lock?.path ? `${this.module}.${lock.path}` : this.module
        } else {
          lockPath = lock.path
        }

        // enabled flag for not if checkking everytime
        if (lock?.enabled === false) {
          return
        }

        // check if data is empty
        if (!lock?.data || Array.isArray(lock?.data) && lock.data.length === 0 || Object?.keys?.length === 0) {
          return
        }

        // set lock
        if (lock?.merge === true) {
          let parsedLockData: [] | Record<string, any>

          // check if array else merge as object
          if (Array.isArray(lock?.data)) {
            const arrayLock: any[] = (objectPath.get(currentLock, lockPath) as any[]) || []
            parsedLockData = [ ...arrayLock, ...lock.data ]
          } else if (typeof lock.data === 'object') {
            parsedLockData = mergeObjects(objectPath.get(currentLock, lockPath) || {}, lock.data)
          } else {
            this.logger.debug(`"${typeof lock.data}" is not mergable.`)
            parsedLockData = [ lock.data ]
          }

          // set lock data
          currentLock = objectPath.set(currentLock, lockPath, parsedLockData)
          this.logger.debug(`Merge lock: "${lockPath}"`)
        } else {
          // dont merge directly set the data
          currentLock = objectPath.set(currentLock, lockPath, lock.data)
          this.logger.debug(`Override lock: "${lockPath}"`)
        }
      })
    )

    // write data
    await this.writeLockFile(currentLock)
  }

  public add<T = Record<string, any> | string | string[]>(data: LockData<T> | LockData<T>[]): void {
    if (Array.isArray(data)) {
      this.toLock = [ ...this.toLock, ...data ]
    } else {
      this.toLock = [ ...this.toLock, data ]
    }
  }

  public addUnlock (data?: UnlockData | UnlockData[]): void {
    if (Array.isArray(data)) {
      this.toUnlock = [ ...this.toUnlock, ...data ]
    } else {
      this.toUnlock = [ ...this.toUnlock, data ]
    }
  }

  public async lockAll (): Promise<void> {
    await this.lock(this.toLock)
    this.toLock = []
  }

  public async unlock (data?: UnlockData | UnlockData[]): Promise<void> {
    // cast to array
    if (data && !Array.isArray(data)) {
      data = [ data ]
    }

    // get lock file
    let currentLock = await this.getLockFile()

    // write data
    if (!currentLock) {
      this.logger.debug('Lock file not found. Nothing to unlock.')
      return
    }

    // option to delete all, or specific locks
    if (Array.isArray(data) && data.length > 0) {
      await Promise.all(
        data.map(async (lock) => {
          let lockPath: string

          if (lock?.root !== true) {
            lockPath = `${this.module}.${lock.path}`
          } else {
            lockPath = lock.path
          }

          // enabled flag for not if checkking everytime
          if (lock?.enabled === false) {
            return
          }

          // set unlock
          currentLock = objectPath.del(currentLock, lockPath)
          this.logger.debug(`Unlocked: ${lockPath}`)
        })
      )
    } else {
      currentLock = objectPath.del(currentLock, this.module)
      this.logger.debug(`Unlocked module: ${this.module}`)
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
    if (this.type === LockerTypes.lock) {
      return config.get('lock')
    } else if (this.type === LockerTypes.local && this?.lockFilePath) {
      return this?.lockFilePath
    } else if (this.type === LockerTypes.local) {
      return config.get('localConfig')
    } else {
      this.logger.fatal('Lock type is not correct. This should not happenned.')
      process.exit(126)
    }
  }

  public async getLockFile<ILockFile extends Record<string, any>>(): Promise<ILockFile> {
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

  public hasLock (): boolean {
    return this.toLock.length > 0
  }

  public hasUnlock (): boolean {
    return this.toUnlock.length > 0
  }
}
