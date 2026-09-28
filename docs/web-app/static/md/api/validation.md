# Validation

`isPageSchemaValid` and `areAllPageSchemasValid` check a page schema against the structure the drawer and the MIDI engine expect. Both are opt-in: nothing in the pipeline needs them, because a schema that comes out of the parser is expected to be valid already.

## 1. isPageSchemaValid

Let's start with a schema that has a wrong duration in it:

```js
import { isPageSchemaValid } from '#msq/api.js'

const result = isPageSchemaValid({
  measuresParams: [
    { stavesParams: [ { voicesParams: [ [ { unitDuration: 0.3 } ] ] } ] }
  ]
})

console.log(result.valid)
console.log(result.errors.map((error) => error.stack))
```

And as a result you get:

```text
false
[
  'instance.measuresParams[0].stavesParams[0].voicesParams[0][0].unitDuration 0.3 is not presented in possibleValues [ 4, 2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625, 0.0078125, 0.00390625 ]'
]
```

It's important to mention that, despite its name, `isPageSchemaValid` does not return a boolean. It returns the result object of the vendored JSON schema validator in `src/language/lib/`, and the answer is in its `valid` field. Each entry of `errors` names the path to the value and what is wrong with it. So you always read `result.valid`: the result itself is an object, and an object is always truthy.

## 2. areAllPageSchemasValid

`areAllPageSchemasValid(pageSchemas)` takes an array of schemas, one per page, and is meant to answer for all of them at once:

```js
import { areAllPageSchemasValid } from '#msq/api.js'

areAllPageSchemasValid(pageSchemaForEachPage)
```

**Important note:** at the moment it returns `true` for any array, because it passes each result object to `every` rather than its `valid` field, and an object is always truthy. Until that is fixed, check each page with `isPageSchemaValid` and read `valid`:

```js
const allValid = pageSchemaForEachPage.every(
  (pageSchema) => isPageSchemaValid(pageSchema).valid
)
```

The worker has the same limitation: it calls `isPageSchemaValid` before engraving and replies `Page schema is not valid` when the result is falsy, which it never is.

## 3. What they check

The schema they check against is `src/language/schema/pageSchema.js`. It describes every field a page, a measure, a stave, a unit, a note and a mark can have, and for each one it checks:

1. the **type**, for example `title` has to be a string and `measuresParams` an array;
2. the **allowed values**, for example a `clef` has to be one of the eleven clef names, a `unitDuration` one of **4** to **1/256**, a `noteName` one of **a** to **g**;
3. **ranges**, for example `octaveNumber` from **1** to **9**, or a tie's `roundCoefficientFactor` from **1** to **10**;
4. **shapes of numbers**, for example a note's `positionNumber` has to be whole or a half, and a time signature's numerator a positive integer;
5. **required fields**, for example every slur, tuplet, octave sign and pedal mark needs its `key`, and every articulation its `name`.

## 4. What they do not check

They check structure, not music. You have to remember the following limits:

1. **Unknown fields pass.** A unit with a field the schema does not describe is still valid, so a misspelt field name is not caught. This is also what lets the pipeline add its own fields, like `pageIndex`, to a schema that has already been checked.
2. **Empty and zero values pass the custom checks.** The checks for allowed values, ranges and non-empty strings skip any falsy value, so `title: ''` and `numberOfDots: 0` are both valid.
3. **Nothing is checked across units.** Four whole notes in a measure of **2/4** are valid, and so is a slur that is started but never finished.
4. **Only the page schema is checked**, not the custom styles or the MIDI settings.

## 5. When to call them

The parser always produces a schema of the right shape, so for text you parse yourself, validation adds little. It is for schemas that did not come from the parser:

1. a schema you **built by hand** or generated in your own code;
2. a schema you **imported**, for example from `tools/musicxml/fromMusicXml.js`, before you engrave it;
3. a schema you **changed** between parsing and drawing;
4. **tests**, to assert that a refactor did not change the shape of what the parser writes.

## 6. Validation and the parser's errors

These are two different lists. The `errors` that `generateIntermediateStructuresForSinglePage` returns are about the **text**: each one is a line the parser could not use, and it skipped that line and went on, as you remember from [Handling errors](/docs/language/handling-errors). Validation is about the **object**: it does not know there was ever any text. A page full of parser errors still gives a valid schema, because what the parser could not understand never got into it.

Read next: [The page schema](/docs/api/page-schema)
