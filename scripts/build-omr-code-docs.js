#!/usr/bin/env node

'use strict'

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(repositoryRoot, 'dev-docs/omr-code.html')
const sourcePaths = collectSourcePaths()
const files = sourcePaths.map(readSourceFile)
const filesByPath = new Map(files.map(file => [ file.path, file ]))
const snapshotHash = createHash('sha256')
for (const file of files) {
  snapshotHash.update(file.path)
  snapshotHash.update('\0')
  snapshotHash.update(file.source)
  snapshotHash.update('\0')
}
const snapshot = snapshotHash.digest('hex')
const scenes = buildScenes()
const functionCount = files.reduce((count, file) => count + file.functions.length, 0)
const html = renderDocument().split('\n').map(line => line.trimEnd()).join('\n')
if (process.argv.includes('--check')) {
  const existing = fs.readFileSync(outputPath, 'utf8')
  if (existing !== html) {
    console.error(`${path.relative(repositoryRoot, outputPath)} is stale; run node scripts/build-omr-code-docs.js`)
    process.exitCode = 1
  } else {
    console.log(`${path.relative(repositoryRoot, outputPath)} is current: ${files.length} files, ${functionCount} functions, snapshot ${snapshot}`)
  }
} else {
  fs.writeFileSync(outputPath, html)
  console.log(`Wrote ${path.relative(repositoryRoot, outputPath)} from ${files.length} files and ${functionCount} functions; snapshot ${snapshot}`)
}

function collectSourcePaths () {
  const paths = []
  collectRecursively('src/omr', '.js', paths)
  collectRecursively('omr-cli-app', '.js', paths)
  collectRecursively('remote-training-scripts', '.sh', paths)
  for (const name of fs.readdirSync(path.join(repositoryRoot, 'scripts'))) {
    if ((name.startsWith('omr-') && name.endsWith('.js')) || name === 'build-omr-code-docs.js') {
      paths.push(`scripts/${name}`)
    }
  }
  return [ ...new Set(paths) ].sort()
}

function collectRecursively (directory, extension, paths) {
  const absoluteDirectory = path.join(repositoryRoot, directory)
  if (!fs.existsSync(absoluteDirectory)) {
    return
  }
  for (const entry of fs.readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = `${directory}/${entry.name}`
    if (entry.isDirectory()) {
      collectRecursively(relativePath, extension, paths)
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      paths.push(relativePath)
    }
  }
}

function readSourceFile (relativePath) {
  const source = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8')
  return {
    path: relativePath,
    source,
    lineCount: source.split('\n').length - (source.endsWith('\n') ? 1 : 0),
    functions: findFunctions(source),
    exports: findExports(source),
    summary: findSummary(source)
  }
}

function findFunctions (source) {
  const lines = source.split('\n')
  const functions = []
  lines.forEach((line, index) => {
    const declaration = line.match(/^(\s*)(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/)
    if (declaration) {
      functions.push({
        name: declaration[2],
        exported: /^\s*export\s/.test(line),
        startLine: index + 1,
        endLine: findFunctionEnd(lines, index, declaration[1])
      })
      return
    }
    const arrow = line.match(/^(\s*)(export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{?\s*$/)
    if (arrow) {
      functions.push({
        name: arrow[3],
        exported: Boolean(arrow[2]),
        startLine: index + 1,
        endLine: line.trimEnd().endsWith('{') ? findFunctionEnd(lines, index, arrow[1]) : index + 1
      })
    }
  })
  return functions
}

function findFunctionEnd (lines, startLineIndex, indentation) {
  const closingLine = new RegExp(`^${indentation}}[),;]?\\s*$`)
  let inTemplate = false
  for (let index = startLineIndex + 1; index < lines.length; index++) {
    if (!inTemplate && closingLine.test(lines[index])) {
      return index + 1
    }
    const backticks = lines[index].match(/(?<!\\)`/g) || []
    if (backticks.length % 2) {
      inTemplate = !inTemplate
    }
  }
  return startLineIndex + 1
}

function findExports (source) {
  const names = new Set()
  for (const match of source.matchAll(/^export\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm)) {
    names.add(match[1])
  }
  for (const match of source.matchAll(/^export\s+const\s+([A-Za-z_$][\w$]*)/gm)) {
    names.add(match[1])
  }
  for (const match of source.matchAll(/^export\s*\{([^}]+)\}/gm)) {
    for (const item of match[1].split(',')) {
      const name = item.trim().split(/\s+as\s+/).pop()
      if (name) {
        names.add(name)
      }
    }
  }
  for (const match of source.matchAll(/^export\s+default\s+([A-Za-z_$][\w$]*)/gm)) {
    names.add(`default: ${match[1]}`)
  }
  return [ ...names ]
}

function findSummary (source) {
  const comment = source.match(/\/\*\*([\s\S]*?)\*\//)
  if (!comment) {
    return ''
  }
  const lines = comment[1].split('\n').map(line => line.replace(/^\s*\* ?/, '').trim())
  const summary = []
  for (const line of lines) {
    if (!line) {
      if (summary.length) {
        break
      }
      continue
    }
    if (line.startsWith('⟅') || line.startsWith('src/')) {
      continue
    }
    summary.push(line)
  }
  return summary.join(' ')
}

function buildScenes () {
  return [
    scene('translation', 'image → MSQ + OCR', [
      frame(
        'The CLI requires an artifact',
        'main reads the candidate JSON before translation. There is no shipped-model fallback and no silent default weights file.',
        'omr-cli-app/omr.js', 'main', [ 'input', 'artifacts' ],
        { call: 'main', input: '--weights=<candidate.json> · --input score.png', output: 'score.msq · report · optional diagnostics' }
      ),
      frame(
        'The symbol model is checked explicitly',
        'loadModelArtifact requires shape.gridSize, unique classIds and all four layers, then checks the output count against the class order.',
        'src/omr/model/loadModelArtifact.js', 'loadModelArtifact', [ 'artifacts' ],
        { call: 'loadModelArtifact', input: 'candidate artifact', output: '{ model, classIds } or an error' }
      ),
      frame(
        'One page, one pipeline',
        'translatePage straightens once, measures the page, extracts and translates symbols, recognizes text, attaches only exact OCR, serializes and reports uncertainties.',
        'src/omr/translateImageToMsq.js', 'translatePage', [ 'geometry', 'symbols', 'music', 'ocr', 'schema' ],
        { call: 'translateImageToMsq → translatePage', input: 'bitmap · options · carried state', output: '{ result: { msqText, report }, carried }' }
      ),
      frame(
        'The classifier uses the artifact grid',
        'classifyWithModel accepts either an already loaded model and classIds or the top-level weights object. Each source component is resampled to the artifact’s own grid before classification.',
        'src/omr/translateImageToMsq.js', 'classifyWithModel', [ 'artifacts', 'symbols' ],
        { call: 'translatePage → classifyWithModel → classifyComponent', input: 'source bitmap · component box', output: 'className · confidence · candidates' }
      ),
      frame(
        'Geometry first, learned classes second',
        'extractSymbols removes stave lines, finds barlines and stems, separates curves and hairpins, splits touching components, and classifies the remaining blobs.',
        'src/omr/analysis/extractSymbols.js', 'extractSymbols', [ 'geometry', 'symbols' ],
        { call: 'translatePage → extractSymbols', output: '{ blobs, stems, barLines, curves, hairpins }' }
      ),
      frame(
        'Symbols become measures and voices',
        'buildMusicModel groups chords, derives pitches and durations, slices systems into measures, splits voices and attaches curves, hairpins and measure furniture.',
        'src/omr/translation/buildMusicModel.js', 'buildMusicModel', [ 'music' ],
        { call: 'translatePage → buildMusicModel', output: 'clefs · key and meter · measures → staves → voices → units' }
      ),
      frame(
        'OCR is nested inside the combined candidate',
        'recognizePageText reads options.ocrWeights or options.weights.ocr. Without a character classifier, candidate text stays unrecognized and becomes located uncertainties.',
        'src/omr/translateImageToMsq.js', 'recognizePageText', [ 'artifacts', 'ocr' ],
        { call: 'translatePage → recognizePageText', input: 'options.ocrWeights || options.weights?.ocr', output: 'exact, draft or rejected OCR; never guessed text' }
      ),
      frame(
        'Only exact text is attached',
        'The three attachment stages write page metadata, instrument titles and unit text after the music schema exists. Draft or rejected OCR cannot overwrite it.',
        'src/omr/translateImageToMsq.js', 'translatePage', [ 'ocr', 'schema' ],
        { call: 'buildPageSchemaFromMusicModel → attachRecognizedPageMetadata → attachRecognizedInstrumentTitles → attachRecognizedUnitText', output: 'page schema → MSQ text' }
      ),
      frame(
        'Uncertainties remain visible',
        'createReport includes low-confidence and unknown blobs, unsupported or unowned ink, and OCR uncertainties added by translatePage.',
        'src/omr/translateImageToMsq.js', 'createReport', [ 'schema', 'input' ],
        { call: 'translatePage → createReport', output: '{ uncertain, ignored } with boxes and, where possible, unit and MSQ line' }
      ),
      frame(
        'Pages carry declarations, not hidden state',
        'translateImagesToMsqPages calls translatePage in order and threads carried key, meter and style state while retaining one report per page.',
        'src/omr/translateImagesToMsqPages.js', 'translateImagesToMsqPages', [ 'schema' ],
        { call: 'translateImagesToMsqPages', input: 'one bitmap per page', output: '{ pagesText, report }' }
      )
    ]),
    scene('geometry', 'local geometry + intervals', [
      frame(
        'The reference interval is not every local interval',
        'detectStaves returns each stave with its own intervalBetweenStaveLines and staveLineThickness, plus one page-level referenceIntervalBetweenStaveLines.',
        'src/omr/analysis/detectStaves.js', 'detectStaves', [ 'geometry' ],
        { output: '{ staves, referenceIntervalBetweenStaveLines }' }
      ),
      frame(
        'Each stave keeps its own measurements',
        'buildStave measures the mean gap between that stave’s measured lines and its median line thickness. The old staffSpaceHeightPx name is not the current contract.',
        'src/omr/analysis/detectStaves.js', 'buildStave', [ 'geometry' ],
        { output: 'linesY · intervalBetweenStaveLines · staveLineThickness · topY · bottomY · xStart · xEnd' }
      ),
      frame(
        'Position numbers interpolate locally',
        'measurePositionNumber counts half intervals from the top line, using the two measured lines around the point and the nearest end interval outside the stave.',
        'src/omr/analysis/measurePositionNumber.js', 'measurePositionNumber', [ 'geometry', 'music' ],
        { call: 'extractSymbols → positionNumberOf → measurePositionNumber', output: 'integer positionNumber or null' }
      ),
      frame(
        'The analysis exposes the real names',
        'analyzeStraightenedImage returns referenceIntervalBetweenStaveLines, per-stave intervalBetweenStaveLines and staveLineThickness, localIntervals, textBlocks, measuredStyles and colors.',
        'src/omr/analysis/analyzeImage.js', 'analyzeStraightenedImage', [ 'geometry' ],
        { call: 'analyzeImage → deskewBitmap → analyzeStraightenedImage', output: 'the complete measured page analysis' }
      ),
      frame(
        'Every gap is measured where it occurs',
        'measureLocalIntervals records adjacent staves within each system and adjacent systems separately. Each entry carries page-line or stave indexes, pixels and a local normalized value.',
        'src/omr/analysis/measureLocalIntervals.js', 'measureLocalIntervals', [ 'geometry' ],
        { output: '{ intervalBetweenStaves: [...], intervalBetweenPageLines: [...] }' }
      ),
      frame(
        'Style averages do not replace local gaps',
        'measureStyles returns the local arrays and also derives the two average style declarations from them. The local arrays remain available for diagnostics.',
        'src/omr/analysis/measureStyles.js', 'measureStyles', [ 'geometry' ],
        { output: '{ fontSizes, colors, localIntervals }' }
      ),
      frame(
        'Training can vary every stave and gap independently',
        'varyFullPageLocalGeometry builds a piecewise vertical warp from every source stave line, varies local intervals and gaps, expands the output canvas and records the resulting geometry.',
        'src/omr/training/mutation/varyFullPageLocalGeometry.js', 'varyFullPageLocalGeometry', [ 'dataset', 'geometry' ],
        { output: 'mutated bitmap · sourcePoints/targetPoints · per-stave and per-gap metadata' }
      )
    ]),
    scene('ocr', 'six-language OCR + attachment', [
      frame(
        'One explicit alphabet',
        'The manifest names English, French, German, Italian, Spanish and Russian and exposes the exact ordered character list used as classIds.',
        'src/omr/training/text/createTextOcrAlphabetManifest.js', 'createTextOcrAlphabetManifest', [ 'artifacts', 'ocr' ],
        { output: 'name · version · six languages · characterCount · characters' }
      ),
      frame(
        'The corpus holds out whole compositions',
        'The title/subtitle corpus contains training and heldOut entries across all six languages. Holding out a whole composition prevents its subtitle from leaking its title into evaluation.',
        'src/omr/training/text/titleSubtitleTextCorpus.js', null, [ 'dataset', 'ocr' ],
        { contents: '18 compositions · six languages · train or heldOut' }
      ),
      frame(
        'Character truth comes from font objects',
        'generateTextOcrTrainingSet renders every alphabet entry through the actual text and chord-letter fonts, sizes and scales, then degrades and normalizes the crop.',
        'src/omr/training/text/generateTextOcrTrainingSet.js', 'generateTextOcrTrainingSet', [ 'dataset', 'ocr' ],
        { output: '{ classIds, samples } with character, font, fontSize and scale metadata' }
      ),
      frame(
        'Geometry proposes an owner before OCR',
        'assignTextBlockTargets associates instrument labels and nearby unit-text candidates with schema locations. It does not decide what the text says or which field should receive it.',
        'src/omr/ocr/assignTextBlockTargets.js', 'assignTextBlockTargets', [ 'geometry', 'ocr' ],
        { output: 'text blocks with optional instrumentTitle or unitTextCandidate targets' }
      ),
      frame(
        'Lines become character crops',
        'segmentTextLines finds line bands, blank-column spaces and conservative cuts through touching runs. Wide letters are not split merely because their profile has a valley.',
        'src/omr/ocr/segmentTextLines.js', 'segmentTextLines', [ 'ocr' ],
        { output: 'ready or rejected lines with character and space candidates' }
      ),
      frame(
        'The OCR artifact must match the alphabet',
        'createCharacterClassifier loads the nested OCR artifact and rejects any class order that differs from the six-language manifest.',
        'src/omr/ocr/createCharacterClassifier.js', 'createCharacterClassifier', [ 'artifacts', 'ocr' ],
        { output: 'classifyCharacter(candidate) using the artifact grid' }
      ),
      frame(
        'No spelling stage rescues a glyph',
        'recognizeTextLines accepts only an alphabet character above the confidence threshold. A line is exact only when every non-space candidate resolves; otherwise its text is null.',
        'src/omr/ocr/recognizeTextLines.js', 'recognizeTextLines', [ 'ocr' ],
        { output: 'status · text · lines · uncertainties · alphabetManifest' }
      ),
      frame(
        'Exact unit text gets a semantic target',
        'classifyRecognizedTextTargets distinguishes dynamic marks, chord letters above a stave, lyrics below it and tempo marks above it. The original unit location stays attached.',
        'src/omr/ocr/classifyRecognizedTextTargets.js', 'classifyRecognizedTextTargets', [ 'ocr', 'music' ],
        { targets: 'dynamicMark · relatedChordLetter · relatedLyrics · tempoMark' }
      ),
      frame(
        'Dynamics and chords attach to the existing unit',
        'attachRecognizedUnitText writes relatedChordLetter and dynamicMark only at the targeted measure, stave, voice and unit. It also handles lyrics and tempo; missing structure is left alone.',
        'src/omr/ocr/attachRecognizedUnitText.js', 'attachRecognizedUnitText', [ 'ocr', 'schema' ],
        { call: 'attachRecognizedUnitText → attachDynamicMark / lyricFrom', output: 'updated page schema; no invented units' }
      ),
      frame(
        'Full-page records carry text supervision',
        'extractTextTrainingTargets collects title/subtitle targets and dynamic/chord-letter targets from the unmutated page schema.',
        'src/omr/training/text/extractTextTrainingTargets.js', 'extractTextTrainingTargets', [ 'dataset', 'ocr' ],
        { output: 'targetType · schema indexes where applicable · expectedText' }
      )
    ]),
    scene('full-page', 'full-page data factory', [
      frame(
        'Styles are renderer inputs, not bitmap paint',
        'rendererStylePresets expands the style definitions across Bravura and Leland. The presets cover light, dark, negative, contrast and layout variants.',
        'src/omr/training/style/rendererStylePresets.js', null, [ 'dataset' ],
        { contents: 'baseStyles + presetDefinitions → rendererStylePresets' }
      ),
      frame(
        'Every preset appears once per shuffled cycle',
        'selectBalancedRendererStylePreset derives each cycle from the seed and sample index, so selection is balanced and repeatable without shared sampler state.',
        'src/omr/training/style/selectBalancedRendererStylePreset.js', 'selectBalancedRendererStylePreset', [ 'dataset' ],
        { output: 'one deterministic style preset for the sample index' }
      ),
      frame(
        'Preset declarations override source declarations',
        'appendRendererStylePresetToMsq appends the style commands after the source MSQ. rendererStylePresetToMsq rejects unsupported style names instead of dropping them.',
        'src/omr/training/style/appendRendererStylePresetToMsq.js', 'appendRendererStylePresetToMsq', [ 'dataset' ],
        { call: 'appendRendererStylePresetToMsq → rendererStylePresetToMsq', output: 'source MSQ + deliberate style mutation' }
      ),
      frame(
        'A composition has one split',
        'assignFullPageCompositionSplits assigns train, validation or test before pages and variants are produced, with explicit overrides and deterministic composition-level draws.',
        'src/omr/training/fullPage/assignFullPageCompositionSplits.js', 'assignFullPageCompositionSplits', [ 'dataset' ],
        { output: 'Map(compositionId → split); variants cannot cross the split' }
      ),
      frame(
        'The full-page factory is deterministic and streamable',
        'generateFullPageRendererDataset validates inputs, chooses styles and mutation profiles by sample index, derives independent seeds, and can emit each sample through onSample without collecting the dataset in memory.',
        'src/omr/training/fullPage/generateFullPageRendererDataset.js', 'generateFullPageRendererDataset', [ 'dataset' ],
        { input: 'sourceRecords · variantsPerRecord · seed · scale · styles · mutations · text corpus', output: 'full-page samples with labels and metadata' }
      ),
      frame(
        'The notation target stays unmutated',
        'renderSample parses and renders the styled MSQ, rasterizes clean SVG, optionally varies local geometry, mutates pixels, and keeps the canonical schema and source SVG geometry separate from those mutations.',
        'src/omr/training/fullPage/generateFullPageRendererDataset.js', 'renderSample', [ 'dataset', 'geometry' ],
        { output: 'bitmap · canonicalPageSchema · canonicalMsq · stylePreset · mutationMetadata · rasterizationMetadata · sourceSvgGeometry · localGeometryMetadata · textTargets' }
      ),
      frame(
        'The mutation chain preserves the whole page',
        'mutateFullPageBitmap applies warp, blur, ink thickness, illumination, contrast and noise in that order. Geometric output expands around the page; the clean profile only copies pixels.',
        'src/omr/training/mutation/mutateFullPageBitmap.js', 'mutateFullPageBitmap', [ 'dataset' ],
        { profiles: 'clean · screenshot · scan-light · scan-medium · scan-hard', output: 'bitmap + requested, derived and per-operation metadata' }
      ),
      frame(
        'Source geometry remains in SVG coordinates',
        'extractSourceSvgSemanticGeometry records semantic groups and primitives in unmutated SVG user units, with raster dimensions kept as separate metadata.',
        'src/omr/training/fullPage/extractSourceSvgSemanticGeometry.js', 'extractSourceSvgSemanticGeometry', [ 'dataset', 'geometry' ],
        { output: 'viewport · groups · primitives · unsupported SVG features' }
      ),
      frame(
        'SVG truth follows the bitmap transforms',
        'cropFullPageTrainingSamples maps source SVG bounds through scale, local geometry and the forward page homography, then crops the mutated bitmap. It never asks a detector to relabel a training crop.',
        'src/omr/training/fullPage/cropFullPageTrainingSamples.js', 'cropFullPageTrainingSamples', [ 'dataset', 'geometry' ],
        { output: 'normalized symbol crops with classId, composition split, font, scale, mutation profile and box' }
      ),
      frame(
        'The remote bundle freezes pages, crops and hashes',
        'omr-prepare-remote generates each full-page PNG and JSON record across the requested scales, adds symbolSamples and per-PNG SHA-256 values, then writes the manifest with code, data and config hashes.',
        'scripts/omr-prepare-remote.js', null, [ 'dataset', 'training' ],
        { command: 'node scripts/omr-prepare-remote.js --out=training-data/remote-bundle --code-version=<frozen-revision>', output: 'PNG pages · JSON labels and symbolSamples · manifest.json', note: 'This is data generation, not recognition testing or training.' }
      ),
      frame(
        'Remote inputs can be pinned without host state',
        'createFullPageRemoteRunManifest hashes code, data and config with stable serialization. It describes a run; it does not itself generate data or start training.',
        'src/omr/training/fullPage/createFullPageRemoteRunManifest.js', 'createFullPageRemoteRunManifest', [ 'training', 'dataset' ],
        { output: 'code/data/config versions and SHA-256 hashes' }
      )
    ]),
    scene('canonical', 'canonical visible comparison', [
      frame(
        'Generated MSQ goes back through the language',
        'parseAndSerializeGeneratedMsq parses the generated text, returns parser errors and serializes the resulting page schema with visible custom styles. Playback settings and source comments are outside this comparison path.',
        'src/omr/canonical/parseAndSerializeGeneratedMsq.js', 'parseAndSerializeGeneratedMsq', [ 'canonical', 'schema' ],
        { output: '{ pageSchema, customStyles, serializedMsq, errors }' }
      ),
      frame(
        'Only visible schema fields survive normalization',
        'normalizePageSchemaForVisibleComparison walks the language schema with a small explicit extension list, sorts object keys, preserves notation array order, normalizes negative zero and removes editor reference ids.',
        'src/omr/canonical/normalizePageSchemaForVisibleComparison.js', 'normalizePageSchemaForVisibleComparison', [ 'canonical' ],
        { output: 'canonical visible page schema; renderer/editor bookkeeping removed' }
      ),
      frame(
        'Comparison is normalization followed by a semantic walk',
        'compareVisiblePageSchemas compares normalized expected and actual schemas and reports equality only when there are no differences.',
        'src/omr/canonical/compareVisiblePageSchemas.js', 'compareVisiblePageSchemas', [ 'canonical' ],
        { output: '{ equal, differences }' }
      ),
      frame(
        'Visible custom styles have their own comparison',
        'compareVisibleCustomStyles removes playback-only fields, nested objects and nullish values, sorts the remaining scalar declarations, and can tolerate a chosen numeric measurement difference.',
        'src/omr/canonical/compareVisibleCustomStyles.js', 'compareVisibleCustomStyles', [ 'canonical', 'geometry' ],
        { output: '{ equal, differences } after the numeric tolerance is applied' }
      ),
      frame(
        'Differences name their exact paths',
        'findSemanticDifferences recursively compares primitives, arrays and object properties, including missing array items, and returns path/expected/actual records.',
        'src/omr/canonical/findSemanticDifferences.js', 'findSemanticDifferences', [ 'canonical' ],
        { output: '[{ path, expected, actual }]' }
      ),
      frame(
        'Verification requires schema, style and report equality',
        'verifyPage rasterizes an expected SVG, translates with supplied weights, parses the MSQ, compares visible page schemas and custom styles, and accepts only when both comparisons are equal with zero uncertain and zero ignored entries.',
        'scripts/omr-verify.js', 'verifyPage', [ 'canonical', 'artifacts' ],
        { call: 'rasterizeSvg → translateImageToMsq → parseAndSerializeGeneratedMsq → compareVisiblePageSchemas + compareVisibleCustomStyles', note: 'This documents the verifier; no verification was run to generate this page.' }
      )
    ]),
    scene('training', 'frozen code → manual remote training', [
      frame(
        'Freeze code and documentation first',
        'The pre-training boundary is the reviewed source and this documentation. Publish that exact state, then remote-git-pull makes the server match origin/omr. Training does not redefine the implementation.',
        'remote-training-scripts/remote-git-pull.sh', null, [ 'training' ],
        { sequence: '1 · freeze and publish code/docs → 2 · sync the remote checkout', note: 'The script fetches, checks out omr and resets it to origin/omr.' }
      ),
      frame(
        'Freeze the full-page bundle before training',
        'omr-prepare-remote writes the generated pages, source-derived symbol crops and a manifest that pins code, data and configuration. The bundle is an input to training, not a test result.',
        'scripts/omr-prepare-remote.js', null, [ 'dataset', 'training' ],
        { sequence: '3 · generate and retain the frozen full-page bundle', command: 'node scripts/omr-prepare-remote.js --out=training-data/remote-bundle --code-version=<frozen-revision>' }
      ),
      frame(
        'Loading respects the composition split',
        'loadFullPageSymbolTrainingSet reads only the requested split from manifest.samples, remaps classes to the classifier order and adds a configurable number of seeded hard negatives.',
        'src/omr/training/fullPage/loadFullPageSymbolTrainingSet.js', 'loadFullPageSymbolTrainingSet', [ 'dataset', 'training' ],
        { output: '{ classIds, samples, manifest }' }
      ),
      frame(
        'Full-page symbol training is a manual remote entry point',
        'omr-train-full-page loads the frozen train and validation splits, adds isolated renderer samples, degrades training crops afresh per epoch and writes best weights, history and a run manifest.',
        'scripts/omr-train-full-page.js', null, [ 'training', 'dataset', 'artifacts' ],
        { sequence: '4 · manually start full-page symbol training only after the code, docs and bundle are frozen', command: 'node scripts/omr-train-full-page.js --data=training-data/remote-bundle/manifest.json --out=training-data/full-page-runs/<run-id>' }
      ),
      frame(
        'The trainer keeps the lowest-validation-loss model',
        'trainModel shuffles with a seed, trains batches with forward and backward passes plus AdamW, evaluates each epoch and can regenerate fresh epoch samples.',
        'src/omr/training/train.js', 'trainModel', [ 'training' ],
        { output: '{ model: best validation checkpoint, history }' }
      ),
      frame(
        'The older isolated-renderer entry point remains explicit',
        'runTraining is the separate renderer/template symbol workflow used by remote-start-training. It creates a timestamp/pid run directory and logs best weights and their SHA-256; it is not the full-page bundle trainer.',
        'src/omr/training/train.js', 'runTraining', [ 'training', 'dataset', 'artifacts' ],
        { alternative: './remote-training-scripts/remote-start-training.sh --dataset=renderer --validation=mixed', output: 'training-data/runs/<run-id>/{training.log,history.json,best-weights.json}' }
      ),
      frame(
        'Six-language OCR is a separate manual remote run',
        'omr-train-text generates character samples, trains with fresh per-epoch variants, and writes best weights, history and a manifest. Its own comment makes the manual-only boundary explicit.',
        'scripts/omr-train-text.js', null, [ 'training', 'ocr', 'artifacts' ],
        { sequence: '5 · manually run on the remote trainer after the same code/docs freeze', command: 'node scripts/omr-train-text.js --out=training-data/text-runs/<run-id> --seed=20261115 --grid=48 --epochs=20 --samples-per-character=4' }
      ),
      frame(
        'Combine two validated artifacts, not two guesses',
        'omr-combine-artifacts validates the symbol artifact and the OCR alphabet, writes the OCR model under the top-level ocr property and records both input SHA-256 hashes.',
        'scripts/omr-combine-artifacts.js', null, [ 'artifacts' ],
        { sequence: '6 · combine the chosen full-page symbol and OCR candidates', command: 'node scripts/omr-combine-artifacts.js --symbols=<symbol-best-weights.json> --ocr=<ocr-best-weights.json> --out=<combined-candidate.json>', output: 'top-level symbol shape/layers/classIds + nested ocr artifact + metadata' }
      ),
      frame(
        'Weights are data and travel separately',
        'remote-download-model copies model data and the legacy symbol training log with rsync, then prints a local SHA-256 for comparison. It does not fetch every custom run directory, adopt a candidate or validate it.',
        'remote-training-scripts/remote-download-model.sh', null, [ 'training', 'artifacts' ],
        { sequence: '7 · retrieve the chosen run outputs explicitly and compare their hashes' }
      ),
      frame(
        'Evaluation comes after training, never before as a claim',
        'omr-evaluate-model loads an explicit candidate, evaluates fresh renderer samples by font and can run the real PNG fixture through translation. No accuracy number is asserted by this source page.',
        'scripts/omr-evaluate-model.js', null, [ 'canonical', 'artifacts' ],
        { sequence: '8 · evaluate locally before any adoption decision', command: 'node scripts/omr-evaluate-model.js --weights=<combined-candidate.json> --fixture=omr-cli-app/score.png', note: 'No tests, data generation, training, scale checks or CLI translation were run to generate this documentation.' }
      )
    ])
  ]
}

function scene (id, name, frames) {
  return { id, name, frames }
}

function frame (title, text, filePath, functionName, activeNodes, state = {}) {
  const file = filesByPath.get(filePath)
  if (!file) {
    throw new Error(`Walkthrough references a missing source file: ${filePath}`)
  }
  let range = [ 1, file.lineCount ]
  if (functionName) {
    const declaration = file.functions.find(item => item.name === functionName)
    if (!declaration) {
      throw new Error(`Walkthrough references missing function ${functionName} in ${filePath}`)
    }
    range = [ declaration.startLine, declaration.endLine ]
  }
  return {
    title,
    text,
    file: filePath,
    range,
    activeNodes,
    state,
    message: {
      file: filePath,
      lines: range[0] === range[1] ? String(range[0]) : `${range[0]}–${range[1]}`,
      ...state
    }
  }
}

function renderDocument () {
  return `<!DOCTYPE html>
<meta charset="UTF-8">
<title>MuSemantiQ — OMR code and frozen pre-training workflow</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root {
  --bg: #fdfdfb;
  --panel: #ffffff;
  --code-bg: #f4f3ef;
  --fg: #17181a;
  --muted: #6b7076;
  --line: #e4e4e0;
  --accent: #a5322a;
  --accent-soft: #f6e9e6;
  --hot: #b07d18;
  --ok: #2f6b3c;
  --c-kw: #8a3ffc;
  --c-str: #1e7a3c;
  --c-com: #7d8b8e;
  --c-num: #c0306a;
  --font-body: system-ui, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif;
  --font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  --font-serif: Georgia, "Times New Roman", serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #1c1714; --panel: #241e19; --code-bg: #191411; --fg: #ede8e3; --muted: #a4938a; --line: #3b322c;
    --accent: #d98c82; --accent-soft: #3a2620; --hot: #e0b055; --ok: #8fc49b;
    --c-kw: #c4a2ff; --c-str: #7fd49a; --c-com: #96857c; --c-num: #ff9fb0;
    color-scheme: dark;
  }
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 24px; }
body { background: var(--bg); color: var(--fg); font-family: var(--font-body); font-size: 15.5px; line-height: 1.6; margin: 0; }
a { color: var(--accent); }
code, pre { font-family: var(--font-mono); }
.wrap { max-width: 1420px; margin: 0 auto; padding: 24px 18px 64px; display: grid; gap: 16px; }
header.top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px 18px; }
header.top h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(24px, 3vw, 34px); line-height: 1.2; font-weight: 400; }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
.intro { margin: 0; color: var(--muted); max-width: 96ch; }
.links { display: flex; flex-wrap: wrap; gap: 8px 14px; font: 12.5px var(--font-mono); }
.facts { display: flex; flex-wrap: wrap; gap: 8px; }
.facts span { border: 1px solid var(--line); background: var(--panel); border-radius: 999px; padding: 3px 10px; font: 12px var(--font-mono); color: var(--muted); }
.notice { border-left: 3px solid var(--accent); background: var(--accent-soft); padding: 10px 14px; max-width: 100ch; }
.notice b { font-weight: 650; }
.player, .workflow, .inventory { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
.player { padding: 10px 12px; display: grid; gap: 10px; }
.tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.tabs button, .ctrl button, .view, .fn {
  font: 500 12.5px var(--font-body); color: var(--muted); background: transparent; border: 1px solid var(--line);
  border-radius: 6px; padding: 4px 10px; cursor: pointer;
}
.tabs button { border-radius: 999px; }
.tabs button[aria-selected="true"] { background: var(--accent); border-color: var(--accent); color: var(--panel); }
button:focus-visible, input:focus-visible { outline: 2px solid var(--hot); outline-offset: 2px; }
.ctrl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ctrl button { color: var(--fg); background: var(--accent-soft); min-width: 42px; }
.ctrl button.primary { background: var(--accent); color: var(--panel); border-color: var(--accent); }
.ctrl button:disabled { opacity: .45; cursor: default; }
.ctrl input[type="range"] { flex: 1; min-width: 120px; accent-color: var(--accent); }
.count { font: 500 12.5px var(--font-mono); color: var(--muted); min-width: 68px; text-align: right; }
.caption { display: grid; gap: 2px; }
.caption b { font-size: 16px; }
.caption span { color: var(--muted); font-size: 14px; max-width: 110ch; }
.keys { font-size: 12px; color: var(--muted); }
kbd { font: 11px var(--font-mono); border: 1px solid var(--line); border-radius: 3px; padding: 0 4px; background: var(--code-bg); }
.stage { display: grid; grid-template-columns: minmax(300px, .8fr) minmax(0, 1.2fr); gap: 14px; align-items: start; }
@media (max-width: 960px) { .stage { grid-template-columns: 1fr; } }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; min-width: 0; }
.card > .hd { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 10px; padding: 8px 12px; border-bottom: 1px solid var(--line); font: 500 11.5px var(--font-mono); color: var(--muted); }
.card > .hd b { color: var(--accent); font-weight: 500; overflow-wrap: anywhere; }
.left { display: grid; gap: 14px; min-width: 0; }
svg.sys { display: block; width: 100%; height: auto; }
.edge { stroke: var(--line); stroke-width: 2; fill: none; }
.node rect { fill: var(--accent-soft); stroke: var(--line); stroke-width: 1.5; }
.node.on rect { fill: color-mix(in srgb, var(--ok) 20%, var(--panel)); stroke: var(--ok); stroke-width: 2.5; }
.node text { font: 600 12px var(--font-body); fill: var(--fg); text-anchor: middle; }
.node text.k { font: 500 9.5px var(--font-mono); fill: var(--muted); }
.state { padding: 10px 12px; display: grid; gap: 7px; }
.state h3 { margin: 0; font: 500 11px var(--font-mono); text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
pre.msg { margin: 0; font: 11.5px/1.5 var(--font-mono); background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 8px 10px; overflow: auto; max-height: 320px; white-space: pre-wrap; overflow-wrap: anywhere; }
.codebox { height: min(72vh, 760px); overflow: auto; background: var(--code-bg); border-radius: 0 0 8px 8px; }
.codebox ol { list-style: none; margin: 0; padding: 8px 0; font: 12px/1.55 var(--font-mono); min-width: max-content; }
.codebox li { display: grid; grid-template-columns: 54px 1fr; padding-right: 16px; border-left: 3px solid transparent; }
.codebox li .n { color: var(--muted); text-align: right; padding-right: 14px; user-select: none; opacity: .7; }
.codebox li code { font: inherit; white-space: pre; color: var(--fg); }
.codebox li.hl { background: var(--accent-soft); border-left-color: var(--accent); }
.codebox li.hl .n { color: var(--accent); opacity: 1; }
.hljs-keyword { color: var(--c-kw); }
.hljs-string { color: var(--c-str); }
.hljs-comment { color: var(--c-com); font-style: italic; }
.hljs-number { color: var(--c-num); }
.workflow, .inventory { padding: 16px 18px; }
h2 { margin: 0 0 8px; font: 400 25px/1.25 var(--font-serif); }
h3 { margin: 18px 0 6px; font-size: 15px; }
.workflow p, .workflow li, .inventory p { max-width: 100ch; }
.workflow ol { padding-left: 24px; }
.workflow li { margin: 7px 0; }
pre.command { background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 10px 12px; overflow-x: auto; font-size: 12px; }
.warning { color: var(--muted); font-size: 14px; }
.inventory-tools { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
#filter { flex: 1; min-width: 240px; font: 13px var(--font-mono); color: var(--fg); background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 7px 10px; }
#inventory-count { font: 12px var(--font-mono); color: var(--muted); }
.files { display: grid; gap: 6px; }
details.file { border: 1px solid var(--line); border-radius: 6px; background: var(--bg); overflow: hidden; }
details.file[hidden] { display: none; }
details.file summary { cursor: pointer; padding: 8px 10px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
details.file summary:hover { background: var(--accent-soft); }
.file-path { font: 600 12.5px var(--font-mono); overflow-wrap: anywhere; }
.file-meta { color: var(--muted); font: 11.5px var(--font-mono); }
.file-body { border-top: 1px solid var(--line); padding: 10px 12px; display: grid; gap: 8px; }
.file-summary { color: var(--muted); margin: 0; font-size: 13.5px; }
.exports { font: 11.5px/1.6 var(--font-mono); overflow-wrap: anywhere; }
.exports b { color: var(--muted); font-weight: 500; }
.function-list { display: flex; flex-wrap: wrap; gap: 5px; }
.fn { font: 11.5px var(--font-mono); padding: 3px 7px; color: var(--fg); background: var(--panel); }
.fn small { color: var(--muted); }
.empty { color: var(--muted); font-size: 13px; }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
</style>

<div class="wrap">
  <header class="top">
    <div>
      <div class="eyebrow">MuSemantiQ · dev docs · current working source</div>
      <h1>OMR code and the frozen pre-training workflow</h1>
    </div>
    <nav class="links" aria-label="Related documentation">
      <a href="./omr.html">the design</a>
      <a href="./omr-math.html">the math</a>
      <a href="./training.html">remote training background</a>
      <a href="https://github.com/Guseyn/MuSemantiQ">repository</a>
    </nav>
  </header>
  <p class="intro">The animated walkthrough follows the current implementation, not the earlier OMR draft. Below it, the inventory contains every JavaScript file under <code>src/omr/</code>, the OMR CLI and scripts, and the remote shell scripts. Select any file or function to read the exact source captured by the generator.</p>
  <div class="facts">
    <span>${files.length} source files</span>
    <span>${functionCount} declared functions</span>
    <span>${scenes.length} walkthroughs · ${scenes.reduce((count, item) => count + item.frames.length, 0)} frames</span>
    <span>snapshot ${snapshot.slice(0, 16)}</span>
  </div>
  <div class="notice"><b>Pre-training status.</b> This page describes code and data preparation, not a trained result. It makes no accuracy claim. The documented sequence freezes code and documentation first, then starts the symbol and six-language OCR runs manually on the remote trainer. This HTML was generated without running OMR tests, data preparation, training, scale checks, verification or the CLI.</div>

  <section class="player" aria-label="Animated source walkthrough">
    <div class="tabs" role="tablist" id="tabs"></div>
    <div class="ctrl">
      <button id="first" type="button" aria-label="First frame">⏮</button>
      <button id="prev" type="button" aria-label="Previous frame">◀</button>
      <button id="play" type="button" class="primary" aria-label="Play">▶ Play</button>
      <button id="next" type="button" aria-label="Next frame">▶</button>
      <input id="scrub" type="range" min="0" max="0" value="0" aria-label="Frame">
      <span class="count" id="count">1 / 1</span>
    </div>
    <div class="caption" aria-live="polite"><b id="caption-title"></b><span id="caption-text"></span></div>
    <div class="keys"><kbd>←</kbd> <kbd>→</kbd> step · <kbd>space</kbd> play / pause · the inventory below can also open source directly</div>
  </section>

  <div class="stage">
    <div class="left">
      <div class="card">
        <div class="hd"><span>system map</span><b id="active-nodes"></b></div>
        <svg class="sys" viewBox="0 0 900 250" role="img" aria-label="OMR inputs, measured geometry, symbol and text recognition, canonical output, data generation and training">
          <g id="edges"></g>
          <g id="nodes"></g>
        </svg>
      </div>
      <div class="card">
        <div class="hd"><span>frame data</span><b>what this step actually does</b></div>
        <div class="state">
          <h3>Call, input and output</h3>
          <pre class="msg" id="message"></pre>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="hd"><span>MuSemantiQ</span><b id="file-path"></b><span id="file-lines"></span></div>
      <div class="codebox" id="codebox"><ol id="code"></ol></div>
    </div>
  </div>

  <section class="workflow" id="frozen-workflow">
    <h2>The frozen pre-training sequence</h2>
    <p>The order matters. Training starts only after the implementation and documentation are frozen and published. Full-page symbols and six-language OCR have separate manual entry points; the combiner creates the nested artifact that translation expects.</p>
    <ol>
      <li>Freeze and publish the reviewed code and docs. Sync the remote checkout with <code>./remote-training-scripts/remote-git-pull.sh</code>. That script checks out <code>omr</code> and resets it to <code>origin/omr</code>.</li>
      <li>On the remote trainer, generate and retain the frozen full-page bundle. Pin its code version explicitly; the default <code>working-tree</code> label is not a revision identifier:</li>
    </ol>
    <pre class="command">node scripts/omr-prepare-remote.js --out=training-data/remote-bundle --code-version=&lt;frozen-revision&gt;</pre>
    <ol start="3">
      <li>Start full-page symbol training manually on the remote trainer, pointing at that frozen manifest:</li>
    </ol>
    <pre class="command">node scripts/omr-train-full-page.js --data=training-data/remote-bundle/manifest.json --out=training-data/full-page-runs/&lt;run-id&gt;</pre>
    <ol start="4">
      <li>Run six-language OCR training manually on the remote trainer. <code>scripts/omr-train-text.js</code> is not a test entry point:</li>
    </ol>
    <pre class="command">node scripts/omr-train-text.js --out=training-data/text-runs/&lt;run-id&gt; --seed=20261115 --grid=48 --epochs=20 --samples-per-character=4</pre>
    <ol start="5">
      <li>Choose the resulting full-page symbol and OCR artifacts, validate both through the combiner, and write one candidate with the OCR model nested under <code>ocr</code>:</li>
    </ol>
    <pre class="command">node scripts/omr-combine-artifacts.js --symbols=&lt;symbol-best-weights.json&gt; --ocr=&lt;ocr-best-weights.json&gt; --out=&lt;combined-candidate.json&gt;</pre>
    <ol start="6">
      <li>Retrieve the chosen run outputs and compare their SHA-256 hashes. Then evaluate locally before adoption. Data generation and training outputs are not accuracy evidence by themselves.</li>
    </ol>
    <pre class="command">node scripts/omr-evaluate-model.js --weights=&lt;combined-candidate.json&gt; --fixture=omr-cli-app/score.png
node omr-cli-app/omr.js --weights=&lt;combined-candidate.json&gt; --input=score.png --output=score.msq --diagnostics</pre>
    <p class="warning">The older isolated renderer/template workflow is still present as <code>remote-start-training.sh</code> → <code>runTraining()</code>. It is separate from <code>omr-prepare-remote.js</code> → <code>omr-train-full-page.js</code>; the commands are not interchangeable.</p>
    <p>Regenerate this page after source changes with <code>node scripts/build-omr-code-docs.js</code>. The generator reads source files and writes only <code>dev-docs/omr-code.html</code>.</p>
  </section>

  <section class="inventory" id="inventory">
    <h2>Complete file and function inventory</h2>
    <p>Paths, exports, line ranges and source come directly from the working tree at generation time. The function list includes named function declarations and named block-bodied arrow functions, exported or internal; anonymous callbacks are not listed separately. Constant-only modules and shell scripts correctly have an empty function list.</p>
    <div class="inventory-tools">
      <input id="filter" type="search" placeholder="Filter by path, export, function or summary" aria-label="Filter source inventory">
      <span id="inventory-count">${files.length} / ${files.length} files</span>
    </div>
    <div class="files" id="files">
${files.map(renderFileInventory).join('\n')}
    </div>
  </section>
</div>

<script>
${renderRuntime()}
</script>
`
}

function renderFileInventory (file) {
  const search = [ file.path, file.summary, ...file.exports, ...file.functions.map(item => item.name) ].join(' ').toLowerCase()
  return `      <details class="file" data-search="${escapeHtml(search)}">
        <summary><span class="file-path">${escapeHtml(file.path)}</span><span class="file-meta">${file.lineCount} lines · ${file.functions.length} functions</span></summary>
        <div class="file-body">
          ${file.summary ? `<p class="file-summary">${escapeHtml(file.summary)}</p>` : ''}
          <div class="exports"><b>exports:</b> ${file.exports.length ? escapeHtml(file.exports.join(', ')) : 'none (script or internal data module)'}</div>
          <div><button class="view" data-file="${escapeHtml(file.path)}">view whole file</button></div>
          ${file.functions.length ? `<div class="function-list">${file.functions.map(item => `<button class="fn" data-file="${escapeHtml(file.path)}" data-start="${item.startLine}" data-end="${item.endLine}">${escapeHtml(item.name)} <small>${item.startLine}${item.endLine === item.startLine ? '' : `–${item.endLine}`}</small></button>`).join('')}</div>` : '<div class="empty">No declared functions in this file.</div>'}
        </div>
      </details>`
}

function renderRuntime () {
  const fileData = Object.fromEntries(files.map(file => [ file.path, {
    source: file.source,
    functions: file.functions
  } ]))
  const nodes = [
    { id: 'input', x: 80, y: 65, title: 'image + CLI', subtitle: 'PNG · pixels · report' },
    { id: 'artifacts', x: 225, y: 65, title: 'artifacts', subtitle: 'symbols + nested OCR' },
    { id: 'geometry', x: 370, y: 65, title: 'geometry', subtitle: 'local names + intervals' },
    { id: 'symbols', x: 515, y: 65, title: 'symbols', subtitle: 'lines · blobs · classes' },
    { id: 'music', x: 660, y: 65, title: 'music model', subtitle: 'measures · voices · units' },
    { id: 'ocr', x: 805, y: 65, title: 'six-language OCR', subtitle: 'exact text only' },
    { id: 'schema', x: 225, y: 180, title: 'schema + MSQ', subtitle: 'attach · serialize · report' },
    { id: 'dataset', x: 440, y: 180, title: 'full-page data', subtitle: 'styles · mutations · labels' },
    { id: 'canonical', x: 625, y: 180, title: 'canonical compare', subtitle: 'visible schema differences' },
    { id: 'training', x: 805, y: 180, title: 'manual remote runs', subtitle: 'after code/docs freeze' }
  ]
  const edges = [
    [ 80, 65, 225, 65 ], [ 225, 65, 370, 65 ], [ 370, 65, 515, 65 ],
    [ 515, 65, 660, 65 ], [ 660, 65, 805, 65 ], [ 805, 65, 225, 180 ],
    [ 225, 180, 440, 180 ], [ 440, 180, 625, 180 ], [ 625, 180, 805, 180 ]
  ]
  return `(function () {
  const FILES = ${jsonForScript(fileData)}
  const SCENES = ${jsonForScript(scenes)}
  const NODES = ${jsonForScript(nodes)}
  const EDGES = ${jsonForScript(edges)}
  const byId = id => document.getElementById(id)
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const svgNamespace = 'http://www.w3.org/2000/svg'
  const nodeElements = {}

  for (const [ x1, y1, x2, y2 ] of EDGES) {
    const line = document.createElementNS(svgNamespace, 'path')
    line.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2)
    line.setAttribute('class', 'edge')
    byId('edges').appendChild(line)
  }
  for (const node of NODES) {
    const group = document.createElementNS(svgNamespace, 'g')
    group.setAttribute('class', 'node')
    const title = document.createElementNS(svgNamespace, 'title')
    title.textContent = node.title + ' — ' + node.subtitle
    group.appendChild(title)
    const rect = document.createElementNS(svgNamespace, 'rect')
    for (const [ name, value ] of Object.entries({ x: node.x - 66, y: node.y - 25, width: 132, height: 50, rx: 7 })) {
      rect.setAttribute(name, value)
    }
    group.appendChild(rect)
    const label = document.createElementNS(svgNamespace, 'text')
    label.setAttribute('x', node.x)
    label.setAttribute('y', node.y - 3)
    label.textContent = node.title
    group.appendChild(label)
    const subtitle = document.createElementNS(svgNamespace, 'text')
    subtitle.setAttribute('x', node.x)
    subtitle.setAttribute('y', node.y + 14)
    subtitle.setAttribute('class', 'k')
    subtitle.textContent = node.subtitle
    group.appendChild(subtitle)
    byId('nodes').appendChild(group)
    nodeElements[node.id] = group
  }

  function highlight (source) {
    return escapeHtml(source)
  }

  function splitHighlightedLines (html) {
    const output = []
    const open = []
    let current = ''
    const expression = /(<span[^>]*>)|(<\\/span>)|(\\n)|([^<\\n]+)/g
    let match
    while ((match = expression.exec(html))) {
      if (match[1]) {
        open.push(match[1])
        current += match[1]
      } else if (match[2]) {
        open.pop()
        current += match[2]
      } else if (match[3]) {
        current += '</span>'.repeat(open.length)
        output.push(current)
        current = open.join('')
      } else {
        current += match[4]
      }
    }
    output.push(current)
    return output
  }

  const renderedFiles = new Map()
  function sourceLines (filePath) {
    if (!renderedFiles.has(filePath)) {
      renderedFiles.set(filePath, splitHighlightedLines(highlight(FILES[filePath].source.replace(/\\n$/, ''))))
    }
    return renderedFiles.get(filePath)
  }

  let shownFile = null
  function showCode (filePath, range) {
    const lines = sourceLines(filePath)
    if (shownFile !== filePath) {
      byId('code').innerHTML = lines.map((line, index) =>
        '<li data-line="' + (index + 1) + '"><span class="n">' + (index + 1) + '</span><code>' + (line || ' ') + '</code></li>'
      ).join('')
      shownFile = filePath
    }
    byId('file-path').textContent = filePath
    byId('file-lines').textContent = range ? 'lines ' + range[0] + (range[0] === range[1] ? '' : '–' + range[1]) : lines.length + ' lines'
    let first = null
    byId('code').querySelectorAll('li').forEach(item => {
      const line = Number(item.dataset.line)
      const active = range && line >= range[0] && line <= range[1]
      item.classList.toggle('hl', Boolean(active))
      if (active && !first) first = item
    })
    if (first) {
      byId('codebox').scrollTo({ top: Math.max(0, first.offsetTop - 60), behavior: 'auto' })
    } else {
      byId('codebox').scrollTo({ top: 0, behavior: 'auto' })
    }
  }

  let sceneIndex = 0
  let frameIndex = 0
  let timer = null
  let manualSource = false
  SCENES.forEach((item, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.role = 'tab'
    button.id = 'tab-' + item.id
    button.textContent = item.name
    button.addEventListener('click', () => {
      stop()
      sceneIndex = index
      frameIndex = 0
      manualSource = false
      render()
    })
    byId('tabs').appendChild(button)
  })

  function render () {
    const currentScene = SCENES[sceneIndex]
    const currentFrame = currentScene.frames[frameIndex]
    Array.from(byId('tabs').children).forEach((button, index) => button.setAttribute('aria-selected', index === sceneIndex ? 'true' : 'false'))
    byId('scrub').max = currentScene.frames.length - 1
    byId('scrub').value = frameIndex
    byId('count').textContent = (frameIndex + 1) + ' / ' + currentScene.frames.length
    byId('caption-title').textContent = currentFrame.title
    byId('caption-text').textContent = currentFrame.text
    byId('active-nodes').textContent = currentFrame.activeNodes.map(id => NODES.find(node => node.id === id).title).join(' · ')
    for (const node of NODES) {
      nodeElements[node.id].classList.toggle('on', currentFrame.activeNodes.includes(node.id))
    }
    byId('message').textContent = JSON.stringify(currentFrame.message, null, 2)
    showCode(currentFrame.file, currentFrame.range)
    byId('prev').disabled = byId('first').disabled = frameIndex === 0
    byId('next').disabled = frameIndex === currentScene.frames.length - 1
  }

  function stop () {
    if (timer) clearInterval(timer)
    timer = null
    byId('play').textContent = '▶ Play'
    byId('play').setAttribute('aria-label', 'Play')
  }
  function go (difference) {
    manualSource = false
    const count = SCENES[sceneIndex].frames.length
    frameIndex = Math.max(0, Math.min(count - 1, frameIndex + difference))
    render()
  }
  function play () {
    if (manualSource || frameIndex === SCENES[sceneIndex].frames.length - 1) {
      manualSource = false
      frameIndex = 0
      render()
    }
    byId('play').textContent = '❚❚ Pause'
    byId('play').setAttribute('aria-label', 'Pause')
    timer = setInterval(() => {
      if (frameIndex >= SCENES[sceneIndex].frames.length - 1) return stop()
      go(1)
    }, 3200)
  }

  function showInventorySource (button) {
    stop()
    manualSource = true
    const filePath = button.dataset.file
    const start = Number(button.dataset.start || 0)
    const end = Number(button.dataset.end || 0)
    const range = start ? [ start, end ] : null
    byId('caption-title').textContent = 'Source inventory'
    byId('caption-text').textContent = filePath + (range ? ', lines ' + range[0] + (range[0] === range[1] ? '' : '–' + range[1]) : '')
    byId('active-nodes').textContent = 'direct source view'
    for (const node of NODES) nodeElements[node.id].classList.remove('on')
    byId('message').textContent = JSON.stringify({ file: filePath, functions: FILES[filePath].functions }, null, 2)
    showCode(filePath, range)
    byId('file-path').scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  byId('files').addEventListener('click', event => {
    const button = event.target.closest('button[data-file]')
    if (button) showInventorySource(button)
  })
  byId('filter').addEventListener('input', () => {
    const query = byId('filter').value.trim().toLowerCase()
    let visible = 0
    document.querySelectorAll('details.file').forEach(item => {
      item.hidden = query && !item.dataset.search.includes(query)
      if (!item.hidden) visible++
    })
    byId('inventory-count').textContent = visible + ' / ' + ${files.length} + ' files'
  })
  byId('play').addEventListener('click', () => timer ? stop() : play())
  byId('next').addEventListener('click', () => { stop(); go(1) })
  byId('prev').addEventListener('click', () => { stop(); go(-1) })
  byId('first').addEventListener('click', () => { stop(); manualSource = false; frameIndex = 0; render() })
  byId('scrub').addEventListener('input', () => { stop(); manualSource = false; frameIndex = Number(byId('scrub').value); render() })
  document.addEventListener('keydown', event => {
    if ([ 'INPUT', 'TEXTAREA' ].includes(event.target.tagName)) return
    if (event.key === 'ArrowRight') { stop(); go(1); event.preventDefault() }
    else if (event.key === 'ArrowLeft') { stop(); go(-1); event.preventDefault() }
    else if (event.key === ' ' && event.target.tagName !== 'BUTTON') { timer ? stop() : play(); event.preventDefault() }
  })
  render()
})();`
}

function jsonForScript (value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function escapeHtml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
