'use strict'

import fs from 'node:fs/promises'

export async function loadAllegroBurlescoSourceRecord ({
  path = 'dev-tools/web-app/static/js/drawer-inspector.js'
} = {}) {
  const source = await fs.readFile(path, 'utf8')
  const match = source.match(/const DEFAULT_MSQ = `([\s\S]*?)`\s*\n/)
  if (!match) {
    throw new Error(`Could not read Allegro Burlesco MSQ from ${path}`)
  }
  return {
    compositionId: 'allegro-burlesco',
    id: 'allegro-burlesco',
    split: 'test',
    msq: match[1]
  }
}

export default loadAllegroBurlescoSourceRecord
