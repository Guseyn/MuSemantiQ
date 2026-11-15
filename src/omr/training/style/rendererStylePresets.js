'use strict'

const baseStyles = {
  backgroundColor: '#ffffff',
  fontColor: '#121212',
  staveLinesColor: '#343434',
  intervalBetweenStaveLines: 8.5,
  intervalBetweenStaves: 13,
  intervalBetweenPageLines: 10,
  pageLeftAndRightPadding: 8,
  pageTopPadding: 9,
  pageBottomPadding: 9,
  titleFontSize: 5.4,
  subtitleFontSize: 3.8,
  leftSubtitleFontSize: 3.2,
  rightSubtitleFontSize: 3.2,
  pageNumberFontSize: 3.2,
  instrumentTitleFontSize: 3.4,
  textFont: 'noto-serif',
  chordLettersFont: 'gentium plus'
}

const presetDefinitions = [
  {
    id: 'light-standard',
    category: 'light',
    styles: {}
  },
  {
    id: 'light-warm-paper',
    category: 'light',
    styles: {
      backgroundColor: '#fdf5e6',
      fontColor: '#241f1a',
      staveLinesColor: '#453d34',
      textFont: 'noto-serif',
      chordLettersFont: 'gentium plus'
    }
  },
  {
    id: 'light-cool-paper',
    category: 'light',
    styles: {
      backgroundColor: '#f3f7fa',
      fontColor: '#14232d',
      staveLinesColor: '#304550',
      textFont: 'noto-sans',
      chordLettersFont: 'gothic a1'
    }
  },
  {
    id: 'light-high-contrast',
    category: 'light',
    contrast: 'high',
    styles: {
      backgroundColor: '#ffffff',
      fontColor: '#000000',
      staveLinesColor: '#000000'
    }
  },
  {
    id: 'light-soft-contrast',
    category: 'light',
    contrast: 'soft',
    styles: {
      backgroundColor: '#f7f5ef',
      fontColor: '#55534d',
      staveLinesColor: '#68655e'
    }
  },
  {
    id: 'light-blue-ink',
    category: 'light',
    contrast: 'medium',
    styles: {
      backgroundColor: '#fffdf8',
      fontColor: '#173b63',
      staveLinesColor: '#294f73',
      textFont: 'noto-sans',
      chordLettersFont: 'gothic a1'
    }
  },
  {
    id: 'dark-midnight',
    category: 'dark',
    styles: {
      backgroundColor: '#10151c',
      fontColor: '#edf2f7',
      staveLinesColor: '#c7d0d9',
      textFont: 'noto-sans',
      chordLettersFont: 'gothic a1'
    }
  },
  {
    id: 'dark-charcoal',
    category: 'dark',
    styles: {
      backgroundColor: '#242424',
      fontColor: '#f2eee5',
      staveLinesColor: '#d7d0c4'
    }
  },
  {
    id: 'dark-navy',
    category: 'dark',
    styles: {
      backgroundColor: '#101d32',
      fontColor: '#e6edf7',
      staveLinesColor: '#b8c9dd',
      textFont: 'noto-sans',
      chordLettersFont: 'gothic a1'
    }
  },
  {
    id: 'dark-high-contrast',
    category: 'dark',
    contrast: 'high',
    styles: {
      backgroundColor: '#000000',
      fontColor: '#ffffff',
      staveLinesColor: '#ffffff'
    }
  },
  {
    id: 'dark-soft-contrast',
    category: 'dark',
    contrast: 'soft',
    styles: {
      backgroundColor: '#292d30',
      fontColor: '#b9bfc3',
      staveLinesColor: '#a3abb0'
    }
  },
  {
    id: 'dark-amber',
    category: 'dark',
    contrast: 'medium',
    styles: {
      backgroundColor: '#211a12',
      fontColor: '#f2d59b',
      staveLinesColor: '#d6b87e'
    }
  },
  {
    id: 'negative',
    category: 'negative',
    contrast: 'high',
    styles: {
      backgroundColor: '#000000',
      fontColor: '#ffffff',
      staveLinesColor: '#ffffff',
      textFont: 'noto-sans',
      chordLettersFont: 'gothic a1'
    }
  },
  {
    id: 'negative-soft',
    category: 'negative',
    contrast: 'soft',
    styles: {
      backgroundColor: '#181818',
      fontColor: '#d8d8d8',
      staveLinesColor: '#c4c4c4'
    }
  },
  {
    id: 'compact',
    category: 'light',
    layout: 'compact',
    styles: {
      intervalBetweenStaves: 10,
      intervalBetweenPageLines: 7.5,
      pageLeftAndRightPadding: 5.5,
      pageTopPadding: 6,
      pageBottomPadding: 6,
      titleFontSize: 4.8,
      subtitleFontSize: 3.4
    }
  },
  {
    id: 'spacious',
    category: 'light',
    layout: 'spacious',
    styles: {
      intervalBetweenStaves: 17,
      intervalBetweenPageLines: 14,
      pageLeftAndRightPadding: 11,
      pageTopPadding: 12,
      pageBottomPadding: 12,
      titleFontSize: 6,
      subtitleFontSize: 4.2
    }
  },
  {
    id: 'dense',
    category: 'light',
    layout: 'dense',
    styles: {
      backgroundColor: '#f8f8f5',
      intervalBetweenStaveLines: 7.25,
      intervalBetweenStaves: 10.5,
      intervalBetweenPageLines: 8,
      pageLeftAndRightPadding: 5,
      pageTopPadding: 6.5,
      pageBottomPadding: 6.5,
      titleFontSize: 4.8,
      subtitleFontSize: 3.3,
      instrumentTitleFontSize: 3
    }
  },
  {
    id: 'large-print',
    category: 'light',
    layout: 'large-print',
    styles: {
      intervalBetweenStaveLines: 11,
      intervalBetweenStaves: 15,
      intervalBetweenPageLines: 12,
      pageLeftAndRightPadding: 9,
      titleFontSize: 5.8,
      subtitleFontSize: 4.1,
      leftSubtitleFontSize: 3.6,
      rightSubtitleFontSize: 3.6,
      instrumentTitleFontSize: 3.8
    }
  },
  {
    id: 'small-print',
    category: 'light',
    layout: 'small-print',
    styles: {
      backgroundColor: '#f4f4f0',
      intervalBetweenStaveLines: 6.5,
      intervalBetweenStaves: 14,
      intervalBetweenPageLines: 11,
      titleFontSize: 5.6,
      subtitleFontSize: 4,
      textFont: 'noto-sans',
      chordLettersFont: 'gothic a1'
    }
  },
  {
    id: 'editorial',
    category: 'light',
    layout: 'wide-margins',
    styles: {
      backgroundColor: '#fffefa',
      fontColor: '#20201e',
      staveLinesColor: '#3d3d39',
      intervalBetweenStaves: 14.5,
      intervalBetweenPageLines: 12,
      pageLeftAndRightPadding: 14,
      pageTopPadding: 10,
      pageBottomPadding: 11,
      titleFontSize: 6.2,
      subtitleFontSize: 4,
      leftSubtitleFontSize: 3.5,
      rightSubtitleFontSize: 3.5
    }
  }
]

export const rendererStylePresets = presetDefinitions.flatMap((definition) => {
  return [ 'bravura', 'leland' ].map((musicFont) => {
    return {
      id: `${definition.id}-${musicFont}`,
      category: definition.category,
      contrast: definition.contrast || 'standard',
      layout: definition.layout || 'standard',
      styles: {
        ...baseStyles,
        ...definition.styles,
        musicFont
      }
    }
  })
})

export default rendererStylePresets
