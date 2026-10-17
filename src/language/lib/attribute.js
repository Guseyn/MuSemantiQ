'use strict'

import * as helpers from '#msq/language/lib/helpers.js'

/** @type ValidatorResult */
const ValidatorResult = helpers.ValidatorResult
/** @type SchemaError */
const SchemaError = helpers.SchemaError

const attribute = {}

attribute.ignoreProperties = {
  // informative properties
  id: true,
  default: true,
  description: true,
  title: true,
  // arguments to other properties
  additionalItems: true,
  then: true,
  else: true,
  // special-handled properties
  $schema: true,
  $ref: true,
  extends: true
}

/**
 * @name validators
 */
const validators = (attribute.validators = {})

/**
 * Validates whether the instance if of a certain type
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {ValidatorResult|null}
 */
validators.type = function validateType (instance, schema, options, ctx) {
  // Ignore undefined instances
  if (instance === undefined) {
    return null
  }
  const result = new ValidatorResult(instance, schema, options, ctx)
  const types = Array.isArray(schema.type) ? schema.type : [ schema.type ]
  if (!types.some(this.testType.bind(this, instance, schema, options, ctx))) {
    const list = types.map(v => {
      if (!v) return undefined
      const id = v.$id || v.id
      return id ? '<' + id + '>' : v + ''
    })
    result.addError({
      name: 'type',
      argument: list,
      message: 'is not of a type(s) ' + list
    })
  }
  return result
}

function testSchemaNoThrow (instance, options, ctx, callback, schema) {
  const throwError = options.throwError
  const throwAll = options.throwAll
  options.throwError = false
  options.throwAll = false
  const res = this.validateSchema(instance, schema, options, ctx)
  options.throwError = throwError
  options.throwAll = throwAll

  if (!res.valid && callback instanceof Function) {
    callback(res)
  }
  return res.valid
}

/**
 * Validates whether the instance matches some of the given schemas
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {ValidatorResult|null}
 */
validators.anyOf = function validateAnyOf (instance, schema, options, ctx) {
  // Ignore undefined instances
  if (instance === undefined) {
    return null
  }
  const result = new ValidatorResult(instance, schema, options, ctx)
  const inner = new ValidatorResult(instance, schema, options, ctx)
  if (!Array.isArray(schema.anyOf)) {
    throw new SchemaError('anyOf must be an array')
  }
  if (
    !schema.anyOf.some(
      testSchemaNoThrow.bind(this, instance, options, ctx, res => {
        inner.importErrors(res)
      })
    )
  ) {
    const list = schema.anyOf.map((v, i) => {
      const id = v.$id || v.id
      if (id) return '<' + id + '>'
      return (
        (v.title && JSON.stringify(v.title)) ||
        (v['$ref'] && '<' + v['$ref'] + '>') ||
        '[subschema ' + i + ']'
      )
    })
    if (options.nestedErrors) {
      result.importErrors(inner)
    }
    result.addError({
      name: 'anyOf',
      argument: list,
      message: 'is not any of ' + list.join(',')
    })
  }
  return result
}

/**
 * Validates whether the instance matches every given schema
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null}
 */
validators.allOf = function validateAllOf (instance, schema, options, ctx) {
  // Ignore undefined instances
  if (instance === undefined) {
    return null
  }
  if (!Array.isArray(schema.allOf)) {
    throw new SchemaError('allOf must be an array')
  }
  const result = new ValidatorResult(instance, schema, options, ctx)
  const self = this
  schema.allOf.forEach((v, i) => {
    const valid = self.validateSchema(instance, v, options, ctx)
    if (!valid.valid) {
      const id = v.$id || v.id
      const msg =
        id ||
        (v.title && JSON.stringify(v.title)) ||
        (v['$ref'] && '<' + v['$ref'] + '>') ||
        '[subschema ' + i + ']'
      result.addError({
        name: 'allOf',
        argument: { id: msg, length: valid.errors.length, valid },
        message:
          'does not match allOf schema ' +
          msg +
          ' with ' +
          valid.errors.length +
          ' error[s]:'
      })
      result.importErrors(valid)
    }
  })
  return result
}

/**
 * Validates whether the instance matches exactly one of the given schemas
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null}
 */
validators.oneOf = function validateOneOf (instance, schema, options, ctx) {
  // Ignore undefined instances
  if (instance === undefined) {
    return null
  }
  if (!Array.isArray(schema.oneOf)) {
    throw new SchemaError('oneOf must be an array')
  }
  const result = new ValidatorResult(instance, schema, options, ctx)
  const inner = new ValidatorResult(instance, schema, options, ctx)
  const count = schema.oneOf.filter(
    testSchemaNoThrow.bind(this, instance, options, ctx, res => {
      inner.importErrors(res)
    })
  ).length
  const list = schema.oneOf.map((v, i) => {
    const id = v.$id || v.id
    return (
      id ||
      (v.title && JSON.stringify(v.title)) ||
      (v['$ref'] && '<' + v['$ref'] + '>') ||
      '[subschema ' + i + ']'
    )
  })
  if (count !== 1) {
    if (options.nestedErrors) {
      result.importErrors(inner)
    }
    result.addError({
      name: 'oneOf',
      argument: list,
      message: 'is not exactly one from ' + list.join(',')
    })
  }
  return result
}

/**
 * Validates "then" or "else" depending on the result of validating "if"
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null}
 */
validators.if = function validateIf (instance, schema, options, ctx) {
  // Ignore undefined instances
  if (instance === undefined) return null
  if (!helpers.isSchema(schema.if)) { throw new Error('Expected "if" keyword to be a schema') }
  const ifValid = testSchemaNoThrow.call(
    this,
    instance,
    options,
    ctx,
    null,
    schema.if
  )
  const result = new ValidatorResult(instance, schema, options, ctx)
  let res
  if (ifValid) {
    if (schema.then === undefined) return
    if (!helpers.isSchema(schema.then)) { throw new Error('Expected "then" keyword to be a schema') }
    res = this.validateSchema(
      instance,
      schema.then,
      options,
      ctx.makeChild(schema.then)
    )
    result.importErrors(res)
  } else {
    if (schema.else === undefined) return
    if (!helpers.isSchema(schema.else)) { throw new Error('Expected "else" keyword to be a schema') }
    res = this.validateSchema(
      instance,
      schema.else,
      options,
      ctx.makeChild(schema.else)
    )
    result.importErrors(res)
  }
  return result
}

function getEnumerableProperty (object, key) {
  // Determine if `key` shows up in `for (var key in object)`
  // First test Object.hasOwnProperty.call as an optimization: that guarantees it does
  if (Object.hasOwnProperty.call(object, key)) return object[key]
  // Test `key in object` as an optimization; false means it won't
  if (!(key in object)) return
  // Walk the prototype chain and check enumerability

  while ((object = Object.getPrototypeOf(object))) {
    if (Object.propertyIsEnumerable.call(object, key)) return object[key]
  }
}

/**
 * Validates propertyNames
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null|ValidatorResult}
 */
validators.propertyNames = function validatePropertyNames (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.object(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const subschema =
    schema.propertyNames !== undefined ? schema.propertyNames : {}
  if (!helpers.isSchema(subschema)) {
    throw new SchemaError(
      'Expected "propertyNames" to be a schema (object or boolean)'
    )
  }

  for (const property in instance) {
    if (getEnumerableProperty(instance, property) !== undefined) {
      const res = this.validateSchema(
        property,
        subschema,
        options,
        ctx.makeChild(subschema)
      )
      result.importErrors(res)
    }
  }

  return result
}

/**
 * Validates properties
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null|ValidatorResult}
 */
validators.properties = function validateProperties (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.object(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const properties = schema.properties || {}

  for (const property in properties) {
    const subschema = properties[property]
    if (subschema === undefined) {
      continue
    } else if (subschema === null) {
      throw new SchemaError(
        'Unexpected null, expected schema in "properties"'
      )
    }
    if (typeof options.preValidateProperty === 'function') {
      options.preValidateProperty(instance, property, subschema, options, ctx)
    }
    const prop = getEnumerableProperty(instance, property)
    const res = this.validateSchema(
      prop,
      subschema,
      options,
      ctx.makeChild(subschema, property)
    )
    if (res.instance !== result.instance[property]) { result.instance[property] = res.instance }
    result.importErrors(res)
  }
  return result
}

/**
 * Test a specific property within in instance against the additionalProperties schema attribute
 * This ignores properties with definitions in the properties schema attribute, but no other attributes.
 * If too many more types of property-existence tests pop up they may need their own class of tests (like `type` has)
 * @private
 * @return {boolean}
 */
function testAdditionalProperty (
  instance,
  schema,
  options,
  ctx,
  property,
  result
) {
  if (!this.types.object(instance)) return
  if (schema.properties && schema.properties[property] !== undefined) {
    return
  }
  if (schema.additionalProperties === false) {
    result.addError({
      name: 'additionalProperties',
      argument: property,
      message:
        'is not allowed to have the additional property ' +
        JSON.stringify(property)
    })
  } else {
    const additionalProperties = schema.additionalProperties || {}

    if (typeof options.preValidateProperty === 'function') {
      options.preValidateProperty(
        instance,
        property,
        additionalProperties,
        options,
        ctx
      )
    }

    const res = this.validateSchema(
      instance[property],
      additionalProperties,
      options,
      ctx.makeChild(additionalProperties, property)
    )
    if (res.instance !== result.instance[property]) { result.instance[property] = res.instance }
    result.importErrors(res)
  }
}

/**
 * Validates patternProperties
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null|ValidatorResult}
 */
validators.patternProperties = function validatePatternProperties (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.object(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const patternProperties = schema.patternProperties || {}

  for (const property in instance) {
    let test = true

    for (const pattern in patternProperties) {
      const subschema = patternProperties[pattern]
      if (subschema === undefined) {
        continue
      } else if (subschema === null) {
        throw new SchemaError(
          'Unexpected null, expected schema in "patternProperties"'
        )
      }
      let regexp
      try {
        regexp = new RegExp(pattern, 'u')
      } catch (_e) {
        // In the event the stricter handling causes an error, fall back on the forgiving handling
        // DEPRECATED
        regexp = new RegExp(pattern)
      }
      if (!regexp.test(property)) {
        continue
      }
      test = false

      if (typeof options.preValidateProperty === 'function') {
        options.preValidateProperty(instance, property, subschema, options, ctx)
      }

      const res = this.validateSchema(
        instance[property],
        subschema,
        options,
        ctx.makeChild(subschema, property)
      )
      if (res.instance !== result.instance[property]) { result.instance[property] = res.instance }
      result.importErrors(res)
    }
    if (test) {
      testAdditionalProperty.call(
        this,
        instance,
        schema,
        options,
        ctx,
        property,
        result
      )
    }
  }

  return result
}

/**
 * Validates additionalProperties
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null|ValidatorResult}
 */
validators.additionalProperties = function validateAdditionalProperties (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.object(instance)) return
  // if patternProperties is defined then we'll test when that one is called instead
  if (schema.patternProperties) {
    return null
  }
  const result = new ValidatorResult(instance, schema, options, ctx)

  for (const property in instance) {
    testAdditionalProperty.call(
      this,
      instance,
      schema,
      options,
      ctx,
      property,
      result
    )
  }
  return result
}

/**
 * Validates whether the instance value is at least of a certain length, when the instance value is a string.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.minProperties = function validateMinProperties (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.object(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const keys = Object.keys(instance)
  if (!(keys.length >= schema.minProperties)) {
    result.addError({
      name: 'minProperties',
      argument: schema.minProperties,
      message:
        'does not meet minimum property length of ' + schema.minProperties
    })
  }
  return result
}

/**
 * Validates whether the instance value is at most of a certain length, when the instance value is a string.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.maxProperties = function validateMaxProperties (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.object(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const keys = Object.keys(instance)
  if (!(keys.length <= schema.maxProperties)) {
    result.addError({
      name: 'maxProperties',
      argument: schema.maxProperties,
      message:
        'does not meet maximum property length of ' + schema.maxProperties
    })
  }
  return result
}

/**
 * Validates items when instance is an array
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null|ValidatorResult}
 */
validators.items = function validateItems (instance, schema, options, ctx) {
  const self = this
  if (!this.types.array(instance)) return
  if (schema.items === undefined) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  instance.every((value, i) => {
    let items
    if (Array.isArray(schema.items)) {
      items = schema.items[i] === undefined ? schema.additionalItems : schema.items[i]
    } else {
      items = schema.items
    }
    if (items === undefined) {
      return true
    }
    if (items === false) {
      result.addError({
        name: 'items',
        message: 'additionalItems not permitted'
      })
      return false
    }
    const res = self.validateSchema(
      value,
      items,
      options,
      ctx.makeChild(items, i)
    )
    if (res.instance !== result.instance[i]) result.instance[i] = res.instance
    result.importErrors(res)
    return true
  })
  return result
}

/**
 * Validates the "contains" keyword
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {String|null|ValidatorResult}
 */
validators.contains = function validateContains (instance, schema, options, ctx) {
  const self = this
  if (!this.types.array(instance)) return
  if (schema.contains === undefined) return
  if (!helpers.isSchema(schema.contains)) { throw new Error('Expected "contains" keyword to be a schema') }
  const result = new ValidatorResult(instance, schema, options, ctx)
  const count = instance.some((value, i) => {
    const res = self.validateSchema(
      value,
      schema.contains,
      options,
      ctx.makeChild(schema.contains, i)
    )
    return res.errors.length === 0
  })
  if (count === false) {
    result.addError({
      name: 'contains',
      argument: schema.contains,
      message: 'must contain an item matching given schema'
    })
  }
  return result
}

/**
 * Validates minimum and exclusiveMinimum when the type of the instance value is a number.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.minimum = function validateMinimum (instance, schema, options, ctx) {
  if (!this.types.number(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (schema.exclusiveMinimum && schema.exclusiveMinimum === true) {
    if (!(instance > schema.minimum)) {
      result.addError({
        name: 'minimum',
        argument: schema.minimum,
        message: 'must be greater than ' + schema.minimum
      })
    }
  } else {
    if (!(instance >= schema.minimum)) {
      result.addError({
        name: 'minimum',
        argument: schema.minimum,
        message: 'must be greater than or equal to ' + schema.minimum
      })
    }
  }
  return result
}

/**
 * Validates maximum and exclusiveMaximum when the type of the instance value is a number.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.maximum = function validateMaximum (instance, schema, options, ctx) {
  if (!this.types.number(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (schema.exclusiveMaximum && schema.exclusiveMaximum === true) {
    if (!(instance < schema.maximum)) {
      result.addError({
        name: 'maximum',
        argument: schema.maximum,
        message: 'must be less than ' + schema.maximum
      })
    }
  } else {
    if (!(instance <= schema.maximum)) {
      result.addError({
        name: 'maximum',
        argument: schema.maximum,
        message: 'must be less than or equal to ' + schema.maximum
      })
    }
  }
  return result
}

/**
 * Validates the number form of exclusiveMinimum when the type of the instance value is a number.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.exclusiveMinimum = function validateExclusiveMinimum (
  instance,
  schema,
  options,
  ctx
) {
  // Support the boolean form of exclusiveMinimum, which is handled by the "minimum" keyword.
  if (typeof schema.exclusiveMinimum === 'boolean') return
  if (!this.types.number(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const valid = instance > schema.exclusiveMinimum
  if (!valid) {
    result.addError({
      name: 'exclusiveMinimum',
      argument: schema.exclusiveMinimum,
      message: 'must be strictly greater than ' + schema.exclusiveMinimum
    })
  }
  return result
}

/**
 * Validates the number form of exclusiveMaximum when the type of the instance value is a number.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.exclusiveMaximum = function validateExclusiveMaximum (
  instance,
  schema,
  options,
  ctx
) {
  // Support the boolean form of exclusiveMaximum, which is handled by the "maximum" keyword.
  if (typeof schema.exclusiveMaximum === 'boolean') return
  if (!this.types.number(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const valid = instance < schema.exclusiveMaximum
  if (!valid) {
    result.addError({
      name: 'exclusiveMaximum',
      argument: schema.exclusiveMaximum,
      message: 'must be strictly less than ' + schema.exclusiveMaximum
    })
  }
  return result
}

/**
 * Perform validation for multipleOf and divisibleBy, which are essentially the same.
 * @param instance
 * @param schema
 * @param validationType
 * @param errorMessage
 * @returns {String|null}
 */
function validateMultipleOfOrDivisbleBy (
  instance,
  schema,
  options,
  ctx,
  validationType,
  errorMessage
) {
  if (!this.types.number(instance)) return

  const validationArgument = schema[validationType]
  if (validationArgument === 0) {
    throw new SchemaError(validationType + ' cannot be zero')
  }

  const result = new ValidatorResult(instance, schema, options, ctx)

  const instanceDecimals = helpers.getDecimalPlaces(instance)
  const divisorDecimals = helpers.getDecimalPlaces(validationArgument)

  const maxDecimals = Math.max(instanceDecimals, divisorDecimals)
  const multiplier = Math.pow(10, maxDecimals)

  if (
    Math.round(instance * multiplier) %
      Math.round(validationArgument * multiplier) !==
    0
  ) {
    result.addError({
      name: validationType,
      argument: validationArgument,
      message: errorMessage + JSON.stringify(validationArgument)
    })
  }

  return result
}

/**
 * Validates divisibleBy when the type of the instance value is a number.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.multipleOf = function validateMultipleOf (
  instance,
  schema,
  options,
  ctx
) {
  return validateMultipleOfOrDivisbleBy.call(
    this,
    instance,
    schema,
    options,
    ctx,
    'multipleOf',
    'is not a multiple of (divisible by) '
  )
}

/**
 * Validates multipleOf when the type of the instance value is a number.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.divisibleBy = function validateDivisibleBy (
  instance,
  schema,
  options,
  ctx
) {
  return validateMultipleOfOrDivisbleBy.call(
    this,
    instance,
    schema,
    options,
    ctx,
    'divisibleBy',
    'is not divisible by (multiple of) '
  )
}

/**
 * Validates whether the instance value is present.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.required = function validateRequired (
  instance,
  schema,
  options,
  ctx
) {
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (instance === undefined && schema.required === true) {
    // A boolean form is implemented for reverse-compatibility with schemas written against older drafts
    result.addError({
      name: 'required',
      message: 'is required'
    })
  } else if (this.types.object(instance) && Array.isArray(schema.required)) {
    schema.required.forEach(n => {
      if (getEnumerableProperty(instance, n) === undefined) {
        result.addError({
          name: 'required',
          argument: n,
          message: 'requires property ' + JSON.stringify(n)
        })
      }
    })
  }
  return result
}

/**
 * Validates whether the instance value matches the regular expression, when the instance value is a string.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.pattern = function validatePattern (instance, schema, options, ctx) {
  if (!this.types.string(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const pattern = schema.pattern
  let regexp
  try {
    regexp = new RegExp(pattern, 'u')
  } catch (_e) {
    // In the event the stricter handling causes an error, fall back on the forgiving handling
    // DEPRECATED
    regexp = new RegExp(pattern)
  }
  if (!instance.match(regexp)) {
    result.addError({
      name: 'pattern',
      argument: schema.pattern,
      message:
        'does not match pattern ' + JSON.stringify(schema.pattern.toString())
    })
  }
  return result
}

/**
 * Validates whether the instance value is of a certain defined format or a custom
 * format.
 * The following formats are supported for string types:
 *   - date-time
 *   - date
 *   - time
 *   - ip-address
 *   - ipv6
 *   - uri
 *   - color
 *   - host-name
 *   - alpha
 *   - alpha-numeric
 *   - utc-millisec
 * @param instance
 * @param schema
 * @param [options]
 * @param [ctx]
 * @return {String|null}
 */
validators.format = function validateFormat (instance, schema, options, ctx) {
  if (instance === undefined) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (!result.disableFormat && !helpers.isFormat(instance, schema.format, this)) {
    result.addError({
      name: 'format',
      argument: schema.format,
      message:
        'does not conform to the ' +
        JSON.stringify(schema.format) +
        ' format'
    })
  }
  return result
}

/**
 * Validates whether the instance value is at least of a certain length, when the instance value is a string.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.minLength = function validateMinLength (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.string(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const hsp = instance.match(/[\uDC00-\uDFFF]/g)
  const length = instance.length - (hsp ? hsp.length : 0)
  if (!(length >= schema.minLength)) {
    result.addError({
      name: 'minLength',
      argument: schema.minLength,
      message: 'does not meet minimum length of ' + schema.minLength
    })
  }
  return result
}

/**
 * Validates whether the instance value is at most of a certain length, when the instance value is a string.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.maxLength = function validateMaxLength (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.string(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  const hsp = instance.match(/[\uDC00-\uDFFF]/g)
  const length = instance.length - (hsp ? hsp.length : 0)
  if (!(length <= schema.maxLength)) {
    result.addError({
      name: 'maxLength',
      argument: schema.maxLength,
      message: 'does not meet maximum length of ' + schema.maxLength
    })
  }
  return result
}

/**
 * Validates whether instance contains at least a minimum number of items, when the instance is an Array.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.minItems = function validateMinItems (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.array(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (!(instance.length >= schema.minItems)) {
    result.addError({
      name: 'minItems',
      argument: schema.minItems,
      message: 'does not meet minimum length of ' + schema.minItems
    })
  }
  return result
}

/**
 * Validates whether instance contains no more than a maximum number of items, when the instance is an Array.
 * @param instance
 * @param schema
 * @return {String|null}
 */
validators.maxItems = function validateMaxItems (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.array(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (!(instance.length <= schema.maxItems)) {
    result.addError({
      name: 'maxItems',
      argument: schema.maxItems,
      message: 'does not meet maximum length of ' + schema.maxItems
    })
  }
  return result
}

/**
 * Deep compares arrays for duplicates
 * @param v
 * @param i
 * @param a
 * @private
 * @return {boolean}
 */
function testArrays (v, i, a) {
  const len = a.length
  for (let j = i + 1; j < len; j++) {
    if (helpers.deepCompareStrict(v, a[j])) {
      return false
    }
  }
  return true
}

/**
 * Validates whether there are no duplicates, when the instance is an Array.
 * @param instance
 * @return {String|null}
 */
validators.uniqueItems = function validateUniqueItems (
  instance,
  schema,
  options,
  ctx
) {
  if (schema.uniqueItems !== true) return
  if (!this.types.array(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (!instance.every(testArrays)) {
    result.addError({
      name: 'uniqueItems',
      message: 'contains duplicate item'
    })
  }
  return result
}

/**
 * Validate for the presence of dependency properties, if the instance is an object.
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {null|ValidatorResult}
 */
validators.dependencies = function validateDependencies (
  instance,
  schema,
  options,
  ctx
) {
  if (!this.types.object(instance)) return
  const result = new ValidatorResult(instance, schema, options, ctx)

  for (const property in schema.dependencies) {
    if (instance[property] === undefined) {
      continue
    }
    let dep = schema.dependencies[property]
    const childContext = ctx.makeChild(dep, property)
    if (typeof dep === 'string') {
      dep = [ dep ]
    }
    if (Array.isArray(dep)) {
      dep.forEach(prop => {
        if (instance[prop] === undefined) {
          result.addError({
            // FIXME there's two different "dependencies" errors here with slightly different outputs
            // Can we make these the same? Or should we create different error types?
            name: 'dependencies',
            argument: childContext.propertyPath,
            message:
              'property ' +
              prop +
              ' not found, required by ' +
              childContext.propertyPath
          })
        }
      })
    } else {
      const res = this.validateSchema(instance, dep, options, childContext)
      if (result.instance !== res.instance) result.instance = res.instance
      if (res && res.errors.length) {
        result.addError({
          name: 'dependencies',
          argument: childContext.propertyPath,
          message:
            'does not meet dependency required by ' + childContext.propertyPath
        })
        result.importErrors(res)
      }
    }
  }
  return result
}

/**
 * Validates whether the instance value is one of the enumerated values.
 *
 * @param instance
 * @param schema
 * @return {ValidatorResult|null}
 */
validators.enum = function validateEnum (instance, schema, options, ctx) {
  if (instance === undefined) {
    return null
  }
  if (!Array.isArray(schema.enum)) {
    throw new SchemaError('enum expects an array', schema)
  }
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (!schema.enum.some(helpers.deepCompareStrict.bind(null, instance))) {
    result.addError({
      name: 'enum',
      argument: schema.enum,
      message:
        'is not one of enum values: ' + schema.enum.map(String).join(',')
    })
  }
  return result
}

/**
 * Validates whether the instance exactly matches a given value
 *
 * @param instance
 * @param schema
 * @return {ValidatorResult|null}
 */
validators.const = function validateConst (instance, schema, options, ctx) {
  if (instance === undefined) {
    return null
  }
  const result = new ValidatorResult(instance, schema, options, ctx)
  if (!helpers.deepCompareStrict(schema.const, instance)) {
    result.addError({
      name: 'const',
      argument: schema.const,
      message:
        'does not exactly match expected constant: ' + schema.const
    })
  }
  return result
}

/**
 * Validates whether the instance if of a prohibited type.
 * @param instance
 * @param schema
 * @param options
 * @param ctx
 * @return {null|ValidatorResult}
 */
validators.not = validators.disallow = function validateNot (
  instance,
  schema,
  options,
  ctx
) {
  const self = this
  if (instance === undefined) return null
  const result = new ValidatorResult(instance, schema, options, ctx)
  let notTypes = schema.not || schema.disallow
  if (!notTypes) return null
  if (!Array.isArray(notTypes)) notTypes = [ notTypes ]
  notTypes.forEach(type => {
    if (self.testType(instance, schema, options, ctx, type)) {
      const id = type && (type.$id || type.id)
      const schemaId = id || type
      result.addError({
        name: 'not',
        argument: schemaId,
        message: 'is of prohibited type ' + schemaId
      })
    }
  })
  return result
}

export default attribute
export { attribute, validators }
export const ignoreProperties = attribute.ignoreProperties
