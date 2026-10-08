'use strict'

import drawBraceConnection from '#msq/drawer/elements/measure-furniture/cross-stave-connections/drawBraceConnection.js'
import drawBracketConnection from '#msq/drawer/elements/measure-furniture/cross-stave-connections/drawBracketConnection.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

const connections = {
  brace: drawBraceConnection,
  bracket: drawBracketConnection
}

export default function (connectionsParams, numberOfStaves, numberOfStaveLines, isFirstMeasureOnPageLine, measureIndexInGeneral) {
  return (styles, leftOffset, topOffset) => {
    const allConnections = []
    for (let connectionIndex = 0; connectionIndex < connectionsParams.length; connectionIndex++) {
      const connectionParams = connectionsParams[connectionIndex]
      const drawnConnection = connections[connectionParams.name](
        connectionParams.staveStartNumber,
        connectionParams.staveEndNumber,
        numberOfStaves,
        numberOfStaveLines
      )(styles, leftOffset, topOffset)
      addPropertiesToElement(
        drawnConnection,
        {
          'ref-ids': `cross-stave-connection-${measureIndexInGeneral + 1}-${connectionIndex + 1}`
        }
      )
      if (isFirstMeasureOnPageLine && connectionParams.forEachLineId !== undefined) {
        addPropertiesToElement(
          drawnConnection,
          {
            'ref-ids': `cross-stave-connection-for-each-line-${connectionParams.forEachLineId}`
          }
        )
      }
      allConnections.push(drawnConnection)
    }
    const tmpGourpedConnections = createGroup(
      'tmpCombinedConnections',
      allConnections
    )
    for (let connectionIndex = 0; connectionIndex < allConnections.length; connectionIndex++) {
      const connection = allConnections[connectionIndex]
      moveElement(
        connection,
        tmpGourpedConnections.right - connection.right
      )
    }
    return createGroup(
      'combinedConnections',
      allConnections
    )
  }
}
