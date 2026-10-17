'use strict'

/* ─────────────────────────────────────────────────────────── */
/*  ValidationError                                             */
/* ─────────────────────────────────────────────────────────── */

export function ValidationError (message, instance, schema, path, name, argument) {
  if (Array.isArray(path)) {
    this.path = path
    this.property = path.reduce((sum, item) => {
      return sum + makeSuffix(item)
    }, 'instance')
  } else if (path !== undefined) {
    this.property = path
  }

  if (message) this.message = message

  if (schema) {
    const id = schema.$id || schema.id
    this.schema = id || schema
  }

  if (instance !== undefined) this.instance = instance

  this.name = name
  this.argument = argument
  this.stack = this.toString()
}

ValidationError.prototype.toString = function () {
  return this.property + ' ' + this.message
}

/* ─────────────────────────────────────────────────────────── */
/*  ValidatorResult                                             */
/* ─────────────────────────────────────────────────────────── */

export function ValidatorResult (instance, schema, options, ctx) {
  this.instance = instance
  this.schema = schema
  this.options = options
  this.path = ctx.path
  this.propertyPath = ctx.propertyPath
  this.errors = []
  this.throwError = options && options.throwError
  this.throwFirst = options && options.throwFirst
  this.throwAll = options && options.throwAll
  this.disableFormat = options && options.disableFormat === true
}

ValidatorResult.prototype.addError = function (detail) {
  let err

  if (typeof detail === 'string') {
    err = new ValidationError(detail, this.instance, this.schema, this.path)
  } else {
    if (!detail) throw new Error('Missing error detail')
    if (!detail.message) throw new Error('Missing error message')
    if (!detail.name) throw new Error('Missing validator type')

    err = new ValidationError(
      detail.message,
      this.instance,
      this.schema,
      this.path,
      detail.name,
      detail.argument
    )
  }

  this.errors.push(err)

  if (this.throwFirst) throw new ValidatorResultError(this)
  else if (this.throwError) throw err

  return err
}

ValidatorResult.prototype.importErrors = function (res) {
  if (typeof res === 'string' || (res && res.validatorType)) {
    this.addError(res)
  } else if (res && res.errors) {
    this.errors = this.errors.concat(res.errors)
  }
}

ValidatorResult.prototype.toString = function () {
  const stringizer = (v, i) => i + ': ' + v.toString() + '\n'
  return this.errors.map(stringizer).join('')
}

Object.defineProperty(ValidatorResult.prototype, 'valid', {
  get () {
    return !this.errors.length
  }
})

/* ─────────────────────────────────────────────────────────── */
/*  ValidatorResultError                                        */
/* ─────────────────────────────────────────────────────────── */

export function ValidatorResultError (result) {
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, ValidatorResultError)
  }

  this.instance = result.instance
  this.schema = result.schema
  this.options = result.options
  this.errors = result.errors
}

ValidatorResultError.prototype = new Error()
ValidatorResultError.prototype.constructor = ValidatorResultError
ValidatorResultError.prototype.name = 'Validation Error'

/* ─────────────────────────────────────────────────────────── */
/*  SchemaError                                                 */
/* ─────────────────────────────────────────────────────────── */

export function SchemaError (msg, schema) {
  this.message = msg
  this.schema = schema

  Error.call(this, msg)

  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, SchemaError)
  }
}

SchemaError.prototype = Object.create(Error.prototype, {
  constructor: { value: SchemaError, enumerable: false },
  name: { value: 'SchemaError', enumerable: false }
})

/* ─────────────────────────────────────────────────────────── */
/*  SchemaContext                                               */
/* ─────────────────────────────────────────────────────────── */

export function SchemaContext (schema, options, path, base, schemas) {
  this.schema = schema
  this.options = options

  if (Array.isArray(path)) {
    this.path = path
    this.propertyPath = path.reduce((sum, item) => {
      return sum + makeSuffix(item)
    }, 'instance')
  } else {
    this.propertyPath = path
  }

  this.base = base
  this.schemas = schemas
}

SchemaContext.prototype.resolve = function (target) {
  return resolveUrl(this.base, target)
}

SchemaContext.prototype.makeChild = function (schema, propertyName) {
  const path =
    propertyName === undefined ? this.path : this.path.concat([ propertyName ])

  const id = schema.$id || schema.id
  const base = resolveUrl(this.base, id || '')

  const ctx = new SchemaContext(
    schema,
    this.options,
    path,
    base,
    Object.create(this.schemas)
  )

  if (id && !ctx.schemas[base]) {
    ctx.schemas[base] = schema
  }

  return ctx
}

/* ─────────────────────────────────────────────────────────── */
/*  FORMAT REGEXPS                                              */
/* ─────────────────────────────────────────────────────────── */

export const FORMAT_REGEXPS = {
  'date-time': /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-(3[01]|0[1-9]|[12][0-9])[tT ](2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])(\.\d+)?([zZ]|[+-]([0-5][0-9]):(60|[0-5][0-9]))$/,
  date: /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-(3[01]|0[1-9]|[12][0-9])$/,
  time: /^(2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])$/,
  duration: /P(T\d+(H(\d+M(\d+S)?)?|M(\d+S)?|S)|\d+(D|M(\d+D)?|Y(\d+M(\d+D)?)?)(T\d+(H(\d+M(\d+S)?)?|M(\d+S)?|S))?|\d+W)/i,

  // Email
  email: /^(?:[\w!#$%&'*+\-/=?^`{|}~]+\.)*[\w!#$%&'*+\-/=?^`{|}~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/,

  // IP and others
  'ip-address': /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(...big regex omitted for brevity...))\s*$/,

  uuid: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,

  // functions
  'utc-millisec': input =>
    typeof input === 'string' &&
    parseFloat(input) === parseInt(input, 10) &&
    !isNaN(input),

  regex: input => {
    try {
      RegExp(input)
      return true
    } catch {
      return false
    }
  },

  // other patterns...
}

FORMAT_REGEXPS.regexp = FORMAT_REGEXPS.regex
FORMAT_REGEXPS.pattern = FORMAT_REGEXPS.regex
FORMAT_REGEXPS.ipv4 = FORMAT_REGEXPS['ip-address']

/* ─────────────────────────────────────────────────────────── */
/*  isFormat                                                   */
/* ─────────────────────────────────────────────────────────── */

export function isFormat (input, format, validator) {
  if (typeof input === 'string' && FORMAT_REGEXPS[format] !== undefined) {
    const item = FORMAT_REGEXPS[format]
    if (item instanceof RegExp) return item.test(input)
    if (typeof item === 'function') return item(input)
  } else if (
    validator &&
    validator.customFormats &&
    typeof validator.customFormats[format] === 'function'
  ) {
    return validator.customFormats[format](input)
  }
  return true
}

/* ─────────────────────────────────────────────────────────── */
/*  makeSuffix                                                 */
/* ─────────────────────────────────────────────────────────── */

export function makeSuffix (key) {
  key = key.toString()

  if (!key.match(/[.\s[\]]/) && !key.match(/^[\d]/)) return '.' + key
  if (key.match(/^\d+$/)) return '[' + key + ']'

  return '[' + JSON.stringify(key) + ']'
}

/* ─────────────────────────────────────────────────────────── */
/*  deepCompareStrict                                           */
/* ─────────────────────────────────────────────────────────── */

export function deepCompareStrict (a, b) {
  if (typeof a !== typeof b) return false

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false
    if (a.length !== b.length) return false

    return a.every((v, i) => deepCompareStrict(a[i], b[i]))
  }

  if (typeof a === 'object') {
    if (!a || !b) return a === b

    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)

    if (aKeys.length !== bKeys.length) return false

    return aKeys.every(v => deepCompareStrict(a[v], b[v]))
  }

  return a === b
}

/* ─────────────────────────────────────────────────────────── */
/*  deepMerge                                                   */
/* ─────────────────────────────────────────────────────────── */

function deepMerger (target, dst, e, i) {
  if (typeof e === 'object') {
    dst[i] = deepMerge(target[i], e)
  } else {
    if (target.indexOf(e) === -1) dst.push(e)
  }
}

function copyist (src, dst, key) {
  dst[key] = src[key]
}

function copyistWithDeepMerge (target, src, dst, key) {
  if (typeof src[key] !== 'object' || !src[key]) {
    dst[key] = src[key]
  } else {
    if (!target[key]) dst[key] = src[key]
    else dst[key] = deepMerge(target[key], src[key])
  }
}

export function deepMerge (target, src) {
  const array = Array.isArray(src)
  let dst = array ? [] : {}

  if (array) {
    target = target || []
    dst = dst.concat(target)
    src.forEach(deepMerger.bind(null, target, dst))
  } else {
    if (target && typeof target === 'object') {
      Object.keys(target).forEach(copyist.bind(null, target, dst))
    }
    Object.keys(src).forEach(copyistWithDeepMerge.bind(null, target, src, dst))
  }

  return dst
}

/* ─────────────────────────────────────────────────────────── */
/*  objectGetPath                                               */
/* ─────────────────────────────────────────────────────────── */

export function objectGetPath (o, s) {
  const parts = s.split('/').slice(1)
  let k

  while (typeof (k = parts.shift()) === 'string') {
    const n = decodeURIComponent(k.replace(/~0/, '~').replace(/~1/g, '/'))
    if (!(n in o)) return
    o = o[n]
  }

  return o
}

/* ─────────────────────────────────────────────────────────── */
/*  encodePath                                                  */
/* ─────────────────────────────────────────────────────────── */

function pathEncoder (v) {
  return '/' + encodeURIComponent(v).replace(/~/g, '%7E')
}

export function encodePath (a) {
  return a.map(pathEncoder).join('')
}

/* ─────────────────────────────────────────────────────────── */
/*  getDecimalPlaces                                            */
/* ─────────────────────────────────────────────────────────── */

export function getDecimalPlaces (number) {
  let decimalPlaces = 0
  if (isNaN(number)) return decimalPlaces

  if (typeof number !== 'number') number = Number(number)

  const parts = number.toString().split('e')
  if (parts.length === 2) {
    if (parts[1][0] !== '-') return decimalPlaces
    decimalPlaces = Number(parts[1].slice(1))
  }

  const decimalParts = parts[0].split('.')
  if (decimalParts.length === 2) {
    decimalPlaces += decimalParts[1].length
  }

  return decimalPlaces
}

/* ─────────────────────────────────────────────────────────── */
/*  isSchema                                                    */
/* ─────────────────────────────────────────────────────────── */

export function isSchema (val) {
  return (typeof val === 'object' && val) || typeof val === 'boolean'
}

/* ─────────────────────────────────────────────────────────── */
/*  resolveUrl                                                  */
/* ─────────────────────────────────────────────────────────── */

export function resolveUrl (from, to) {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'))

  if (resolvedUrl.protocol === 'resolve:') {
    const { pathname, search, hash } = resolvedUrl
    return pathname + search + hash
  }

  return resolvedUrl.toString()
}
