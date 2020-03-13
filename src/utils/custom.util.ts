import deepmerge from 'deepmerge'
import objectPath from 'object-path'
import { getBorderCharacters, table } from 'table'

import { ObjectLiteral } from '@interfaces/object-literal.interface'

/** Merge objects deep from overwriting the properties from source to target.
 * Does not mutate the object */
export function mergeObjects (target: ObjectLiteral, source: ObjectLiteral): ObjectLiteral {
  return deepmerge(target, source)
}

/** For removing overlapping keys of the source from target.
 * Mutates the object! */
export function removeObjectOverlappingKeys (target: ObjectLiteral, source: ObjectLiteral, deleteEmpty?: boolean, nullIt?: boolean): ObjectLiteral {
  Object.keys(source).forEach((key) => {
    if (!Array.isArray(source[key]) && typeof source[key] === 'object') {

      // do nothing if else
      if (target[key]) {
        // if the key is empty now, delete it whole together
        target[key] = removeObjectOverlappingKeys(target[key], source[key])

        // check for empty remaning object
        if (deleteEmpty !== false && Object.keys(target[key]).length === 0) {
          objectPath.del(target, key)
        }

      }

    } else if (nullIt) {
      target[key] = null

    } else {
      objectPath.del(target, key)

    }

  })

  return target
}

/** Draw a table to the CLI. */
export function createTable (headers: string[], data: string[][]): table {
  data.unshift(headers)

  return table(data, { border: getBorderCharacters('norc') })
}

/** Checks wheter a object is iterable or not */
export function isIterable (obj: any): boolean {
  // checks for null and undefined
  if (obj == null) {
    return false
  }
  return typeof obj[Symbol.iterator] === 'function'
}