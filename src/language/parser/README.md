# The MSQ parser

The parser reads the text of one page and gives back what the rest of MuSemantiQ needs:
the page schema (what the drawer and the MIDI engine read), errors, comments, custom
styles, MIDI settings, and, for the editor, highlights. Everything starts in
`parseLanguage.js`. You normally call it through `src/language/api.js`.

## How a page is parsed

1. **Characters become tokens.** The text is read one character at a time. A token is
   a run of characters without spaces. The spaces after a token are kept with it, so the
   highlights can give the text back exactly as it was written.
2. **Tokens pile up until a scenario takes them.** Each new token goes into an
   accumulator, and every scenario that may come next is asked whether the tokens in it
   are its command. The first scenario that says yes takes them, and the accumulator is
   emptied. If nobody says yes, the next token is added and they are all asked again.
   That's how commands of several words are found. A token that is last on its line and
   still not taken goes to `command is not recognizable`, which reports an error.
3. **Which scenarios may come next is decided by the progression of commands.** It's
   the list of scenarios that are "open" right now, for example
   `[ 'measure', 'stave', 'voice', 'note' ]`. A scenario can require one of them
   (`requiredCommandProgression`), forbid some (`prohibitedCommandProgressions`), and,
   when it's taken, cut the list back to some level and put itself at the end
   (`itIsNewCommandProgressionFromLevel`). The editor's autocomplete reads this list for
   every character (`mapOfCharIndexesWithProgressionOfCommandsFromScenarios`).
4. **A scenario that is taken runs its action.** The main action builds the page schema.
   Then every adapter in use runs its own action for the same scenario (see below).
5. **Some work waits until the command is over.** A scenario can have
   `actionWhenProgressionOfCommandsChanges`. It runs when another scenario changes the
   progression past it, for example when the line after `slur from note 1 to note 3`
   starts. That is where a slur is attached to its units, because only then all its
   positions are known.
6. **At the end**, the waiting actions that should also run at the end of the text run
   (`activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore`),
   and the results are returned.

## What a scenario declares

Main scenarios live in `scenarios/main/add…Scenarios.js`. Each file adds scenarios by
name to one object:

```js
scenarios['measure'] = {
  considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
  condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
    return regexps.measure.test(tokenValues)
  },
  action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
    initMeasureParams(parserState.pageSchema, parserState)
    const numberOfMeasures = parserState.pageSchema.measuresParams.length
    return { numberOfMeasures }
  },
  itIsNewCommandProgressionFromLevel: 0
}
```

| Field | What it does |
| --- | --- |
| `condition` | says whether the tokens are this command |
| `action` | runs when the scenario is taken; what it returns goes to the adapters as `fromMain` |
| `requiredCommandProgression` | the scenario can only follow this one |
| `prohibitedCommandProgressions` | the scenario can't come while any of these is open |
| `itIsNewCommandProgressionFromLevel` | where the progression is cut back to before this scenario is added (`'last level'`: nothing is cut) |
| `startsOnNewLine` | the scenario must be the first one on its line |
| `onTheSameLineAsPrevScenario` | the scenario must be on the same line as the one before |
| `considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem` | `tokenValues` come without `,`, `;` and `and` |
| `type: 'on empty line'` | the scenario is asked on empty lines instead |
| `actionWhenProgressionOfCommandsChanges` | runs when the command is over (step 5) |
| `activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore` | that action also runs at the end of the text |

The order of the files and of the scenarios in them matters: the first scenario whose
condition is met wins. The order is in `createParserScenarios.js`.

`copyScenarioWithDifferentRequiredCommandProgression` makes a scenario that works the
same way after another command, for example `chord with text` from `note with text`.

The scenario names are part of the project: `docs/concepts.js`, `npm run docs:check` and
the editor's autocomplete use them. Don't rename them.

## Adapters

The main scenarios build the page schema. An **adapter** gives the same scenarios another
job. There are two at the moment, both for the editor:

| Adapter | Runs | What it makes |
| --- | --- | --- |
| `highlight` | with the main scenarios | highlights whose spans have `ref-id`s, so the text and the score link to each other |
| `highlight-without-ref-ids` | instead of the main scenarios | highlights without `ref-id`s, fast enough to run on every key press |

The public API picks them for you:

| `applyHighlighting` | `applyOnlyHighlightingWithoutRefIds` | What runs |
| --- | --- | --- |
| `false` | — | the main scenarios |
| `true` (default) | `false` (default) | the main scenarios and `highlight` |
| `true` | `true` | `highlight-without-ref-ids` alone |

Each adapter has a folder in `scenarios/` with an `adapter.js` and scenario files with the
same names as the main ones:

```
scenarios/
  main/                         the page schema, errors, comments, styles, MIDI settings
  highlight/                    adapter.js, add…Scenarios.js
  highlight-without-ref-ids/    adapter.js, add…Scenarios.js
  page-schema/  token/  static-objects/  string/    helpers they share
```

### `adapter.js`

```js
export default {
  name: 'highlight',
  runsWithMain: true,            // false: runs instead of the main scenarios
  coversAllScenarios: false,     // true: every main scenario must have an entry here
  addScenarios: (scenarios) => { addMeasureSetupScenarios(scenarios), … },   // the same order as main
  createState: (parserState) => ({ highlightsHtmlBuffer: [] }),              // its own state, for each page
  addTrailingWhitespace: (state, whitespace) => { … },                        // optional: spaces at the end of the text
  finish: (state, unitext) => ({ highlightsHtmlBuffer: state.highlightsHtmlBuffer })   // added to what the parser returns
}
```

### An adapter's scenarios

An adapter's scenario has the same name as the main one, and only what the adapter needs:

```js
scenarios['measure'] = {
  action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
    state.highlightsHtmlBuffer.push(`<span class="th" ref-id="measure-${numberOfMeasures}">…`)
  },
  actionWhenProgressionOfCommandsChanges: ({ state }) => {
    state.highlightsHtmlBuffer.push('</span>')
  }
}
```

Its functions get one object with:

| Field | What it is |
| --- | --- |
| `state` | the adapter's own state, from `createState` |
| `fromMain` | what the main function for the same scenario returned (empty when the adapter runs alone) |
| `parserState` | the main state: read it, don't change it (except the two fields below) |
| `unitext`, `lineNumber`, `currentToken`, `tokenValues`, `joinedTokenValuesWithRealDelimiters`, `progressionOfCommandsFromScenarios` | the same as the main action gets |
| `scenarioNameThatChangedCommandsProgression`, `argumentsFromMainAction` | in `actionWhenProgressionOfCommandsChanges` only |

Things to know:

1. **The main function runs first, then the adapters, in the order they were asked for.**
   So an adapter sees the page schema after the main action changed it.
2. **What an adapter needs from a main function, the main function returns.** For
   example, `measure` returns `{ numberOfMeasures }`. If the main function changes a
   value after the moment the adapter needs it, it takes the value first and returns
   that. For example, a slur clears the positions it named when it's over, so its main
   function returns `mentionedPositions` (from `page-schema/getMentionedPositions.js`)
   taken before they are cleared.
3. **Conditions belong to the main scenarios.** An adapter that runs alone uses them too.
   Some conditions read `parserState.lastMentionedStyleKey` and
   `parserState.lastMentionedMidiSettingKey`, so an adapter that runs alone sets them,
   the way the main scenarios would.
4. **Copies of scenarios follow the main ones.** The adapter's files make the same
   copies, so `chord with text` gets what `note with text` has.
5. When the parser loads, `createParserScenarios.js` checks that every adapter scenario
   has a main scenario with that name, and that an adapter with
   `coversAllScenarios: true` has all of them.

## How to add an adapter

Let's say you want the line of every note, for a list beside the editor.

1. Make a folder `scenarios/note-lines/` with an `adapter.js`:

   ```js
   import addNoteSetupScenarios from '#msq/language/parser/scenarios/note-lines/addNoteSetupScenarios.js'

   export default {
     name: 'note-lines',
     runsWithMain: true,
     coversAllScenarios: false,
     addScenarios: (scenarios) => {
       addNoteSetupScenarios(scenarios)
     },
     createState: () => ({ noteLines: [] }),
     finish: (state) => ({ noteLines: state.noteLines })
   }
   ```

2. Add the scenarios it cares about, with the same names as the main ones, in
   `scenarios/note-lines/addNoteSetupScenarios.js`:

   ```js
   export default function (scenarios) {
     scenarios['note'] = {
       action: ({ lineNumber, state }) => {
         state.noteLines.push(lineNumber)
       }
     }
   }
   ```

   If it needs something the main action knows, make the main action return it, and
   read it from `fromMain`.

3. Add it to `scenarios/adapters.js`.
4. Pass its name to the parser: `parseLanguage(text, [], { adapterNames: [ 'note-lines' ] })`.
   To make it part of the public API, choose it in `parserOptions` in `src/language/api.js`.
5. Run `npm run test:all`. Adding an adapter must not change anything the main scenarios
   make, so every test should still pass.

## Tests

- The visual tests compare the highlights with `ref-id`s (`html-highlights/`) and
  without them (`html-highlights-without-ref-ids/`, `char-progressions-without-ref-ids/`)
  for every test, so both adapters are checked, with the page schema and everything else.
- `npm run docs:check` asks the parser which scenarios each docs example used, and checks
  that no example uses a concept before its page. See `docs/concepts.js`.
