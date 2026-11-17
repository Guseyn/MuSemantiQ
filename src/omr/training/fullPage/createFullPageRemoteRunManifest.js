'use strict'

import { createHash } from 'node:crypto'

// No timestamp or host state enters the manifest, so the same inputs describe the same remote run
export function createFullPageRemoteRunManifest ({
  codeVersion,
  dataVersion,
  configVersion,
  code,
  data,
  config
} = {}) {
  assertVersion(codeVersion, 'codeVersion')
  assertVersion(dataVersion, 'dataVersion')
  assertVersion(configVersion, 'configVersion')
  return {
    type: 'full-page-renderer-remote-run-manifest',
    codeVersion,
    dataVersion,
    configVersion,
    hashAlgorithm: 'SHA-256',
    codeSha256: sha256(code),
    dataSha256: sha256(data),
    configSha256: sha256(config)
  }
}

function assertVersion (version, name) {
  if ((typeof version !== 'string' && !Number.isSafeInteger(version)) || version === '') {
    throw new Error(`${name} must be a non-empty string or a safe integer`)
  }
}

function sha256 (value) {
  const hash = createHash('sha256')
  if (typeof value === 'string') {
    hash.update(value, 'utf8')
  } else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    hash.update(value instanceof ArrayBuffer ? new Uint8Array(value) : value)
  } else {
    hash.update(stableSerialization(value) ?? 'undefined', 'utf8')
  }
  return hash.digest('hex')
}

function stableSerialization (value) {
  const ancestors = new WeakSet()
  return serializeValue(value, ancestors, false)
}

function serializeValue (value, ancestors, inArray) {
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return inArray ? 'null' : undefined
  }
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    return JSON.stringify(value)
  }
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'bigint') {
    throw new Error('BigInt values cannot be included in a remote-run manifest hash')
  }
  if (ancestors.has(value)) {
    throw new Error('Circular values cannot be included in a remote-run manifest hash')
  }
  ancestors.add(value)
  let serialized
  if (Array.isArray(value)) {
    serialized = `[${value.map(item => serializeValue(item, ancestors, true)).join(',')}]`
  } else {
    const properties = []
    for (const key of Object.keys(value).sort()) {
      const property = serializeValue(value[key], ancestors, false)
      if (property !== undefined) {
        properties.push(`${JSON.stringify(key)}:${property}`)
      }
    }
    serialized = `{${properties.join(',')}}`
  }
  ancestors.delete(value)
  return serialized
}

export default createFullPageRemoteRunManifest
