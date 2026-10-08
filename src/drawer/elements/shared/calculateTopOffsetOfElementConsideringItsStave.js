'use strict'

export default function (element, numberOfStaveLines, topOffset, styles) {
  const { intervalBetweenStaveLines, intervalBetweenStaves } = styles
  let topOffsetOfElementConsideringItsStave = topOffset
  if (element.stave === 'next') {
    topOffsetOfElementConsideringItsStave = topOffset + (numberOfStaveLines - 1) * intervalBetweenStaveLines + intervalBetweenStaves
  } else if (element.stave === 'prev') {
    topOffsetOfElementConsideringItsStave = topOffset - intervalBetweenStaves - (numberOfStaveLines - 1) * intervalBetweenStaveLines
  }
  return topOffsetOfElementConsideringItsStave
}
