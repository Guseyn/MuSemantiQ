'use strict'

import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createRect from '#msq/drawer/elements/basic/createRect.js'
import createText from '#msq/drawer/elements/basic/createText.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'
import drawMeasures from '#msq/drawer/elements/the-page/measures/drawMeasures.js'

const pageFormats = {
  'c4': [ 9, 12.8 ],
  'a3': [ 11.7, 16.5 ],
  'b4': [ 9.8, 13.9 ],
  'a4': [ 8.3, 11.7 ]
}

const CSS_INCH_IN_PIXELS = 96

export default function (pageParamsOnInput) {
  return (styles, leftOffset, topOffset) => {
    const pageParams = JSON.parse(JSON.stringify(pageParamsOnInput))
    const { pageFormat, pageHeight, intervalBetweenStaveLines, fontColor, pageLeftAndRightPadding, pageColumnStrokeOptions, pageTopPadding, pageBottomPadding, pageLinesTopOffset, titleFontOptions, subtitleFontOptions, leftSubtitleFontOptions, rightSubtitleFontOptions, titleTopOffset, subtitleTopOffset, leftAndRightSubtitlesTopOffset, pageLineMaxWidth, backgroundColor, pageBorderStrokeColor, pageBorderStrokeWidth, emptyMeasuresHeight, pageNumberFontOptions, pageNumberOffsetFromBottomOfThePage } = styles
    const { measuresParams, showMeasureNumbers, directionOfMeasureNumbers, lyricsUnderStaveIndex, compressUnitsByNTimes, stretchUnitsByNTimes, compressUnitsByNTimesInLines, stretchUnitsByNTimesInLines, hideLastMeasure } = pageParams

    const pageLineMaxWidthConsideringFormat = (pageFormat === 'none')
      ? pageLineMaxWidth
      : ((pageFormats[pageFormat][0] * CSS_INCH_IN_PIXELS) - 2 * pageLeftAndRightPadding)

    /* Assigning some page properties to each measure. */
    if (measuresParams) {
      for (let measureIndex = 0; measureIndex < measuresParams.length; measureIndex++) {
        const isLastMeasureInGeneral = measureIndex === measuresParams.length - 1
        measuresParams[measureIndex].lyricsUnderStaveIndex = lyricsUnderStaveIndex || 0
        measuresParams[measureIndex].compressUnitsByNTimes = (compressUnitsByNTimesInLines && compressUnitsByNTimesInLines[measuresParams[measureIndex].pageLineNumber - 1]) ? compressUnitsByNTimesInLines[measuresParams[measureIndex].pageLineNumber - 1] : compressUnitsByNTimes
        measuresParams[measureIndex].stretchUnitsByNTimes = (stretchUnitsByNTimesInLines && stretchUnitsByNTimesInLines[measuresParams[measureIndex].pageLineNumber - 1]) ? stretchUnitsByNTimesInLines[measuresParams[measureIndex].pageLineNumber - 1] : stretchUnitsByNTimes
        if (hideLastMeasure && isLastMeasureInGeneral) {
          measuresParams[measureIndex].isHidden = true
        }
        if (showMeasureNumbers && measureIndex > 0) {
          if (showMeasureNumbers === 'all') {
            measuresParams[measureIndex].showMeasureNumber = true
            measuresParams[measureIndex].directionOfMeasureNumber = directionOfMeasureNumbers || 'up'
          } else {
            if (measuresParams[measureIndex - 1].isLastMeasureOnPageLine) {
              if (showMeasureNumbers === 'first' || showMeasureNumbers === 'first&last') {
                measuresParams[measureIndex].showMeasureNumber = true
                measuresParams[measureIndex].directionOfMeasureNumber = directionOfMeasureNumbers || 'up'
              }
            }
            if (measuresParams[measureIndex].isLastMeasureOnPageLine || isLastMeasureInGeneral) {
              if (showMeasureNumbers === 'last' || showMeasureNumbers === 'first&last') {
                measuresParams[measureIndex].showMeasureNumber = true
                measuresParams[measureIndex].directionOfMeasureNumber = directionOfMeasureNumbers || 'up'
              }
            }
          }
        }
      }
    }

    const pageElements = []
    const xPageCenter = (leftOffset + 2 * pageLeftAndRightPadding + pageLineMaxWidthConsideringFormat) / 2
    let bottomOfMetaInfoOnPage = topOffset + pageTopPadding

    /* Let's draw title if it's specified. */
    if (pageParams.title) {
      const lines = pageParams.title.split(/\\n/)
      const titleElements = []
      lines.forEach((line, index) => {
        const titleLine = createText(
          line.trim(), titleFontOptions
        )(styles, xPageCenter, ((index === 0) ? 0 : titleElements[index - 1].bottom))
        titleElements.push(
          titleLine
        )
      })
      const title = createGroup(
        'title',
        titleElements
      )
      moveElementBelowPointWithInterval(
        title,
        bottomOfMetaInfoOnPage,
        titleTopOffset
      )
      bottomOfMetaInfoOnPage = title.bottom
      addPropertiesToElement(
        title, {
          'ref-ids': 'title'
        }
      )
      pageElements.push(
        title
      )
    }

    /* Let's draw subtitle if it's specified. */
    if (pageParams.subtitle) {
      const lines = pageParams.subtitle.split(/\\n/)
      const subtitleElements = []
      lines.forEach((line, index) => {
        const subtitleLine = createText(
          line.trim(), subtitleFontOptions
        )(styles, xPageCenter, ((index === 0) ? 0 : subtitleElements[index - 1].bottom))
        subtitleElements.push(
          subtitleLine
        )
      })
      const subtitle = createGroup(
        'subtitle',
        subtitleElements
      )
      moveElementBelowPointWithInterval(
        subtitle,
        bottomOfMetaInfoOnPage,
        subtitleTopOffset
      )
      bottomOfMetaInfoOnPage = subtitle.bottom
      addPropertiesToElement(
        subtitle, {
          'ref-ids': 'subtitle'
        }
      )
      pageElements.push(
        subtitle
      )
    }

    /* Let's draw left subtitle if it's specified. */
    if (pageParams.leftSubtitle) {
      const lines = pageParams.leftSubtitle.split(/\\n/)
      let maxLineWidth = 0
      const drawnLines = []
      lines.forEach((line, index) => {
        const leftSubtitleLine = createText(
          line.trim(), leftSubtitleFontOptions
        )(styles, leftOffset + pageLeftAndRightPadding, ((index === 0) ? 0 : drawnLines[index - 1].bottom))
        drawnLines.push(
          leftSubtitleLine
        )
        if (maxLineWidth < (leftSubtitleLine.right - leftSubtitleLine.left)) {
          maxLineWidth = leftSubtitleLine.right - leftSubtitleLine.left
        }
      })
      drawnLines.forEach((line) => {
        moveElement(
          line,
          maxLineWidth / 2
        )
      })
      const leftSubtitle = createGroup(
        'left-subtitle',
        drawnLines
      )
      moveElementBelowPointWithInterval(
        leftSubtitle,
        bottomOfMetaInfoOnPage,
        leftAndRightSubtitlesTopOffset
      )
      if (!pageParams.rightSubtitle) {
        bottomOfMetaInfoOnPage = leftSubtitle.bottom
      }
      addPropertiesToElement(
        leftSubtitle, {
          'ref-ids': 'leftSubtitle'
        }
      )
      pageElements.push(
        leftSubtitle
      )
    }

    /* Let's draw right subtitle if it's specified. */
    if (pageParams.rightSubtitle) {
      const lines = pageParams.rightSubtitle.split(/\\n/)
      let maxLineWidth = 0
      const drawnLines = []
      lines.forEach((line, index) => {
        let rightSubtitleLine = createText(
          line.trim(), rightSubtitleFontOptions
        )(styles, leftOffset + pageLeftAndRightPadding + pageLineMaxWidthConsideringFormat, ((index === 0) ? 0 : drawnLines[index - 1].bottom))
        drawnLines.push(
          rightSubtitleLine
        )
        if (maxLineWidth < (rightSubtitleLine.right - rightSubtitleLine.left)) {
          maxLineWidth = rightSubtitleLine.right - rightSubtitleLine.left
        }
      })
      drawnLines.forEach((line) => {
        moveElement(
          line,
          -maxLineWidth / 2
        )
      })
      const rightSubtitle = createGroup(
        'right-subtitle',
        drawnLines
      )
      moveElementBelowPointWithInterval(
        rightSubtitle,
        bottomOfMetaInfoOnPage,
        leftAndRightSubtitlesTopOffset
      )
      bottomOfMetaInfoOnPage = rightSubtitle.bottom
      addPropertiesToElement(
        rightSubtitle, {
          'ref-ids': 'rightSubtitle'
        }
      )
      pageElements.push(
        rightSubtitle
      )
    }

    /* Let's draw measures if they're are specified, otherwise let's draw empty rect. */
    let measures
    const pageContainsMetaInfo = pageParams.title || pageParams.subtitle || pageParams.leftSubtitle || pageParams.rightSubtitle
    if (measuresParams && measuresParams.length > 0) {
      measures = drawMeasures(measuresParams, pageLineMaxWidthConsideringFormat)(styles, leftOffset, bottomOfMetaInfoOnPage + (pageContainsMetaInfo ? pageLinesTopOffset : 0))
      moveElement(
        measures,
        pageLeftAndRightPadding
      )
    } else {
      measures = createRect(
        pageLineMaxWidthConsideringFormat,
        emptyMeasuresHeight,
        {
          color: backgroundColor,
          width: 0
        },
        backgroundColor,
        leftOffset,
        bottomOfMetaInfoOnPage + (pageContainsMetaInfo ? pageLinesTopOffset : 0)
      )
      moveElement(
        measures,
        pageLeftAndRightPadding
      )
      measures.topOfFirstStave = measures.top
      measures.bottomOfLastPageLineConsideringOnlyStaves = measures.bottom
    }
    pageElements.push(measures)

    /* Let's draw rectangles that give us left and right paddings. */
    const measuresHeightAccordingToStaves = measures.bottomOfLastPageLineConsideringOnlyStaves - measures.topOfFirstStave
    const leftColumn = createRect(pageLeftAndRightPadding, measuresHeightAccordingToStaves, pageColumnStrokeOptions, 'none', 0, measures.topOfFirstStave)
    const rightColumn = createRect(pageLeftAndRightPadding, measuresHeightAccordingToStaves, pageColumnStrokeOptions, 'none', measures.right, measures.topOfFirstStave)
    pageElements.push(
      leftColumn,
      rightColumn
    )

    const pageWidth = (leftColumn.right - leftColumn.left) + pageLineMaxWidthConsideringFormat + (rightColumn.right - rightColumn.left)
    const finalPageHeight = (pageFormat === 'none')
      ? (pageHeight !== null)
        ? pageHeight
        : ((measures.bottomOfLastPageLineConsideringOnlyStaves - topOffset) + pageBottomPadding)
      : (pageFormats[pageFormat][1] * CSS_INCH_IN_PIXELS)

    /* Let's draw page numbers (if needed). */
    if (pageParams.pageNumber !== undefined) {
      const pageNumberText = createText(
        pageParams.pageNumber.trim(),
        pageNumberFontOptions
      )(
        styles,
        xPageCenter,
        0
      )
      moveElementAbovePointWithInterval(
        pageNumberText,
        topOffset + finalPageHeight,
        pageNumberOffsetFromBottomOfThePage
      )
      addPropertiesToElement(
        pageNumberText, {
          'ref-ids': 'pageNumber'
        }
      )
      pageElements.push(
        pageNumberText
      )
    }

    /* Let's draw background for the page to give it background color and borders (if needed) */
    const pageWithoutBorder = createGroup(
      'pageWithoutBorder',
      pageElements
    )
    moveElement(pageWithoutBorder, 0, 0)
    const pageBackground = createRect(
      pageWidth,
      finalPageHeight,
      {
        color: pageBorderStrokeColor,
        width: pageBorderStrokeWidth
      },
      backgroundColor,
      pageWithoutBorder.left,
      topOffset
    )
    addPropertiesToElement(
      pageBackground,
      { 'data-name': 'page-background' }
    )
    const groupedPage = createGroup(
      'page',
      [
        pageBackground,
        pageWithoutBorder
      ]
    )
    addPropertiesToElement(
      groupedPage,
      {
        'data-interval-between-stave-lines': intervalBetweenStaveLines,
        'data-font-color': fontColor
      }
    )
    return groupedPage
  }
}
