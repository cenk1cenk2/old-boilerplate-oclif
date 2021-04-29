import deepmerge from 'deepmerge'
import objectPath from 'object-path-immutable'
import { getBorderCharacters, table } from 'table'

interface MergeObjectsOptions {
  array: 'overwrite' | 'merge'
}

/** Merge objects deep from overwriting the properties from source to target.
 * @deprecated
 * Does not mutate the object */
export function mergeObjects<T extends Record<string, any>> (target: T, source: Record<string, any>, options?: MergeObjectsOptions): T {
  // array strategy
  let arrayMergeStrategy: (destinationArray: any[], sourceArray: any[]) => any[]
  if (options?.array === 'merge') {
    arrayMergeStrategy = (destinationArray, sourceArray): any[] => [ ...destinationArray, ...sourceArray ]
  } else {
    arrayMergeStrategy = (_, sourceArray): any[] => sourceArray
  }

  return deepmerge(target, source, { arrayMerge: arrayMergeStrategy }) as T
}

/**
 * Merge objects with defaults.
 *
 * Mutates the object.
 * @param t
 * @param s
 */
export function deepMerge<T extends Record<string, any>> (t: T, ...s: Partial<T>[]): T {
  return s.reduce((o, val) => {
    return deepmerge(o, val ?? {})
  }, t) as T
}

/**
 * Merge objects with array merge and filtering them uniquely.
 *
 * Mutates the object.
 * @param t
 * @param s
 */
export function deepMergeWithUniqueMergeArray<T extends Record<string, any>> (t: T, ...s: Partial<T>[]): T {
  return s.reduce((o, val) => {
    return deepmerge(o, val ?? {}, {
      arrayMerge: (target, source) => [ ...target, ...source ].filter((item, index, array) => array.indexOf(item) === index)
    })
  }, t) as T
}

/**
 * Merge objects with overwriting the target array with source array.
 *
 * Mutates the object.
 * @param t
 * @param s
 */
export function deepMergeWithArrayOverwrite<T extends Record<string, any>> (t: T, ...s: Partial<T>[]): T {
  return s.reduce((o, val) => {
    return deepmerge(o, val ?? {}, {
      arrayMerge: (_, source) => source
    })
  }, t) as T
}

/** For removing overlapping keys of the source from target. **/
export function removeObjectOverlappingKeys<T extends Record<string, any>> (target: T, source: Record<string, any>, deleteEmpty?: boolean, nullIt?: boolean): T {
  let newTarget = objectPath.assign({}, '', target)

  Object.keys(source).forEach((key) => {
    if (!Array.isArray(source[key]) && typeof source[key] === 'object') {
      // do nothing if else
      if (newTarget[key]) {
        // if the key is empty now, delete it whole together
        newTarget[key] = removeObjectOverlappingKeys(newTarget[key], source[key])

        // check for empty remaning object
        if (deleteEmpty !== false && Object.keys(newTarget[key]).length === 0) {
          newTarget = objectPath.del(newTarget, key)
        }
      }
    } else if (nullIt) {
      newTarget[key] = null
    } else {
      newTarget = objectPath.del(newTarget, key)
    }
  })

  return newTarget as T
}

/** For removing the non-overlapping keys. */
export function removeObjectOtherKeys<T extends Record<string, any>> (target: T, source: Record<string, any>): T {
  let strippedObject = {}

  Object.keys(source).forEach((key) => {
    if (target?.[key] && !Array.isArray(target[key]) && typeof target[key] === 'object') {
      // if the key is empty now, delete it whole together
      strippedObject[key] = removeObjectOtherKeys(target[key], source[key])

      // check for empty remaning object
      if (Object.keys(strippedObject[key]).length === 0) {
        strippedObject = objectPath.del(strippedObject, key)
      }
    } else if (typeof target?.[key] !== 'undefined') {
      strippedObject[key] = target[key]
    }
  })

  return strippedObject as T
}

/** Draw a table to the CLI. */
export function createTable (headers: string[], data: string[][]): ReturnType<typeof table> {
  data.unshift(headers)

  data = data.map((row) =>
    row.reduce((o, column) => {
      return [ ...o, column.toString() ]
    }, [])
  )

  return table(data, { border: getBorderCharacters('norc') })
}

/** Checks whether a object is iterable or not */
export function isIterable (obj: any): boolean {
  // checks for null and undefined
  if (obj == null) {
    return false
  }
  return typeof obj[Symbol.iterator] === 'function'
}
