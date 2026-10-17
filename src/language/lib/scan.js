'use strict'

import * as helpers from '#msq/language/lib/helpers.js'

export function SchemaScanResult (found, ref) {
  this.id = found
  this.ref = ref
}

/**
 * Adds a schema with a certain urn to the Validator instance.
 * @param string uri
 * @param object schema
 * @return {Object}
 */
export function scan (base, schema) {
  function scanSchema (baseuri, schema) {
    if (!schema || typeof schema !== 'object') return

    // Mark referenced schemas
    if (schema.$ref) {
      const resolvedUri = helpers.resolveUrl(baseuri, schema.$ref)
      ref[resolvedUri] = ref[resolvedUri] ? ref[resolvedUri] + 1 : 0
      return
    }

    const id = schema.$id || schema.id
    const resolvedBase = helpers.resolveUrl(baseuri, id)
    const ourBase = id ? resolvedBase : baseuri

    if (ourBase) {
      let baseKey = ourBase

      // Ensure fragment exists
      if (baseKey.indexOf('#') < 0) baseKey += '#'

      if (found[baseKey]) {
        if (!helpers.deepCompareStrict(found[baseKey], schema)) {
          throw new Error('Schema <' + baseKey + '> already exists with different definition')
        }
        return found[baseKey]
      }

      found[baseKey] = schema

      // Also save version without trailing '#'
      if (baseKey.endsWith('#')) {
        found[baseKey.slice(0, -1)] = schema
      }
    }

    scanArray(ourBase + '/items', Array.isArray(schema.items) ? schema.items : [ schema.items ])
    scanArray(ourBase + '/extends', Array.isArray(schema.extends) ? schema.extends : [ schema.extends ])

    scanSchema(ourBase + '/additionalItems', schema.additionalItems)

    scanObject(ourBase + '/properties', schema.properties)
    scanSchema(ourBase + '/additionalProperties', schema.additionalProperties)
    scanObject(ourBase + '/definitions', schema.definitions)
    scanObject(ourBase + '/patternProperties', schema.patternProperties)
    scanObject(ourBase + '/dependencies', schema.dependencies)

    scanArray(ourBase + '/disallow', schema.disallow)
    scanArray(ourBase + '/allOf', schema.allOf)
    scanArray(ourBase + '/anyOf', schema.anyOf)
    scanArray(ourBase + '/oneOf', schema.oneOf)

    scanSchema(ourBase + '/not', schema.not)
  }

  function scanArray (baseuri, schemas) {
    if (!Array.isArray(schemas)) return
    for (let i = 0; i < schemas.length; i++) {
      scanSchema(baseuri + '/' + i, schemas[i])
    }
  }

  function scanObject (baseuri, schemas) {
    if (!schemas || typeof schemas !== 'object') return
    for (const p in schemas) {
      scanSchema(baseuri + '/' + p, schemas[p])
    }
  }

  const found = {}
  const ref = {}

  scanSchema(base, schema)

  return new SchemaScanResult(found, ref)
}

const exported = { SchemaScanResult, scan }

export default exported
