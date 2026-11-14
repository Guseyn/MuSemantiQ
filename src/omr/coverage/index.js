'use strict'

import featureDefinitions from './featureDefinitions.js'
import createFeatureRegistry from './createFeatureRegistry.js'
import implementationStatuses from './implementationStatuses.js'

export default createFeatureRegistry(featureDefinitions, implementationStatuses)
