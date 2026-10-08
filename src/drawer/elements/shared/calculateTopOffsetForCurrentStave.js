'use strict'

export default function (topOffset, staveIndex, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines) {
  return topOffset + staveIndex * (intervalBetweenStaves + intervalBetweenStaveLines * (numberOfStaveLines - 1))
}
