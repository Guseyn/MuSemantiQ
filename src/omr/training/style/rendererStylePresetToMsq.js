'use strict'

const declarationNames = {
  backgroundColor: 'background color',
  fontColor: 'font color',
  staveLinesColor: 'stave lines color',
  intervalBetweenStaveLines: 'interval between stave lines',
  intervalBetweenStaves: 'interval between staves',
  intervalBetweenPageLines: 'interval between lines',
  pageLeftAndRightPadding: 'page left and right paddings',
  pageTopPadding: 'page top padding',
  pageBottomPadding: 'page bottom padding',
  titleFontSize: 'title font size',
  subtitleFontSize: 'subtitle font size',
  leftSubtitleFontSize: 'left subtitle font size',
  rightSubtitleFontSize: 'right subtitle font size',
  pageNumberFontSize: 'page number font size',
  instrumentTitleFontSize: 'instrument title font size',
  musicFont: 'music font',
  textFont: 'text font',
  chordLettersFont: 'chord letters font'
}

export function rendererStylePresetToMsq (preset) {
  if (!preset || !preset.styles || typeof preset.styles !== 'object') {
    throw new Error('preset must have a styles object')
  }
  const declarations = []
  for (const [ styleName, declarationName ] of Object.entries(declarationNames)) {
    if (preset.styles[styleName] !== undefined) {
      declarations.push(`${declarationName} is ${preset.styles[styleName]}`)
    }
  }
  const unsupportedNames = Object.keys(preset.styles).filter((styleName) => !declarationNames[styleName])
  if (unsupportedNames.length) {
    throw new Error(`Unsupported renderer style names: ${unsupportedNames.join(', ')}`)
  }
  return `${declarations.join('\n')}\n`
}

export default rendererStylePresetToMsq
