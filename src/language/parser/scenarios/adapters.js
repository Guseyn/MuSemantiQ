'use strict'

/*
Every adapter the parser knows, by name. An adapter gives the scenarios another job
besides building the page schema (see README.md in the parser folder).
*/

import highlight from '#msq/language/parser/scenarios/highlight/adapter.js'
import highlightWithoutRefIds from '#msq/language/parser/scenarios/highlight-without-ref-ids/adapter.js'

export default {
  [highlight.name]: highlight,
  [highlightWithoutRefIds.name]: highlightWithoutRefIds
}
