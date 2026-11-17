'use strict'

import fs from 'node:fs/promises'

export async function loadVisualFixtureSourceRecords ({
  directory = 'test/visual-tests/bravura/msq',
  fixtures = null,
  includeErrorFixtures = false
} = {}) {
  const names = (fixtures || (await fs.readdir(directory)).filter((name) => name.endsWith('.txt')).sort())
    .filter((name) => includeErrorFixtures || !name.startsWith('error-'))
  const records = []
  for (const name of names) {
    const compositionId = name.endsWith('.txt') ? name.slice(0, -4) : name
    records.push({
      compositionId,
      id: compositionId,
      msq: await fs.readFile(`${directory}/${compositionId}.txt`, 'utf8')
    })
  }
  return records
}

export default loadVisualFixtureSourceRecords
