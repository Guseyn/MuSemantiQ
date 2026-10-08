'use strict'

import pageSchema from '#msq/language/schema/pageSchema.js'
import validator from '#msq/language/schema/tunedValidator.js'

export default function (schemaOnInput) {
  return validator.validate(schemaOnInput, pageSchema, { allowUnknownAttributes: false })
  // TODO:// USER READABLE MESSAGE IN JSON FORMAT
}
