import { merge } from 'lodash'
import { getBorderCharacters, table } from 'table'

import { ObjectLiteral } from '../interfaces/object-literal.interface'

// export function mergeObjects (target: ObjectLiteral, source: ObjectLiteral): ObjectLiteral {
//   if (typeof source === 'object') {
//     Object.keys(source)?.map((key) => {

//       if (Array.isArray(source[key])) {
//         target[key] = source[key]

//         return
//       } else if (typeof source?.[key] === 'object') {
//         const initiateChild = target[key] || {}
//         mergeObjects(initiateChild, source[key])

//         return
//       }

//       target[key] = source[key]
//     })
//   } else {
//     target = source
//   }
//   return target
// }

export function mergeObjects (target: ObjectLiteral, source: ObjectLiteral | string | string[]): ObjectLiteral {
  return merge(target, source)
}

export function createTable (headers: string[], data: string[][]): table {
  data.unshift(headers)

  return table(data, { border: getBorderCharacters('norc') })
}
