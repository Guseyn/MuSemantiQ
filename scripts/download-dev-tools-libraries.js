#!/usr/bin/env node

/*
Downloads nodes, EHTML and e-ui into the dev tools.

The dev tools run on three libraries of the same author: nodes (the server),
EHTML (the pages) and e-ui (the design system). `npm run dev-tools:vendor`
copies them from checkouts next to MuSemantiQ, which only the maintainer has.
This downloads each one as a zip from GitHub instead, and puts the folders the
app needs exactly where `dev-tools:vendor` would put them:

  nodes   nodes/            -> dev-tools/nodes/
  EHTML   src/              -> dev-tools/web-app/static/js/ehtml/
  e-ui    static/js/e-ui/   -> dev-tools/web-app/static/js/e-ui/
          static/css/e-ui.css -> dev-tools/web-app/static/css/e-ui.css

    npm run dev-tools:download          asks before downloading
    npm run dev-tools:download -- --yes does not ask

It asks first, because it downloads code from the internet and replaces those
folders. They are gitignored, so nothing committed is touched.

Node has no unzip, and this project has no dependencies, so the zip is read
here: the central directory at the end of the file lists every entry, and each
entry is either stored or deflated, which zlib can inflate.
*/

import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import readline from 'readline/promises'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const devTools = path.join(projectRoot, 'dev-tools')

const LIBRARIES = [
  {
    name: 'nodes',
    zip: 'https://github.com/Guseyn/nodes.js/archive/refs/heads/main.zip',
    copies: [
      { from: 'nodes/', to: path.join(devTools, 'nodes') }
    ]
  },
  {
    name: 'EHTML',
    zip: 'https://github.com/Guseyn/EHTML/archive/refs/heads/master.zip',
    copies: [
      { from: 'src/', to: path.join(devTools, 'web-app', 'static', 'js', 'ehtml') }
    ]
  },
  {
    name: 'e-ui',
    zip: 'https://github.com/Guseyn/e-ui/archive/refs/heads/main.zip',
    copies: [
      { from: 'static/js/e-ui/', to: path.join(devTools, 'web-app', 'static', 'js', 'e-ui') },
      { from: 'static/css/e-ui.css', to: path.join(devTools, 'web-app', 'static', 'css', 'e-ui.css') }
    ]
  }
]

/*
Every file in the zip, as { name, data }. GitHub puts everything under one
folder named after the repository and the branch (`EHTML-master/`), which is
cut off, so names start from the root of the repository.
*/
function filesInZip(zip) {
  const END_OF_CENTRAL_DIRECTORY = 0x06054b50
  const CENTRAL_DIRECTORY_ENTRY = 0x02014b50
  const LOCAL_ENTRY = 0x04034b50
  const STORED = 0
  const DEFLATED = 8

  let end = zip.length - 22
  while (end >= 0 && zip.readUInt32LE(end) !== END_OF_CENTRAL_DIRECTORY) {
    end--
  }
  if (end < 0) {
    throw new Error('this is not a zip file')
  }

  const numberOfEntries = zip.readUInt16LE(end + 10)
  let entry = zip.readUInt32LE(end + 16)
  const files = []

  for (let index = 0; index < numberOfEntries; index++) {
    if (zip.readUInt32LE(entry) !== CENTRAL_DIRECTORY_ENTRY) {
      throw new Error('the zip file is broken')
    }
    const method = zip.readUInt16LE(entry + 10)
    const compressedSize = zip.readUInt32LE(entry + 20)
    const nameLength = zip.readUInt16LE(entry + 28)
    const extraLength = zip.readUInt16LE(entry + 30)
    const commentLength = zip.readUInt16LE(entry + 32)
    const localEntry = zip.readUInt32LE(entry + 42)
    const fullName = zip.toString('utf-8', entry + 46, entry + 46 + nameLength)
    entry += 46 + nameLength + extraLength + commentLength

    // folders are made when their files are written
    if (fullName.endsWith('/')) {
      continue
    }
    if (zip.readUInt32LE(localEntry) !== LOCAL_ENTRY) {
      throw new Error(`the zip file is broken at ${fullName}`)
    }
    // the local entry has its own name and extra field, which can differ in length from the central one
    const dataStart = localEntry + 30 + zip.readUInt16LE(localEntry + 26) + zip.readUInt16LE(localEntry + 28)
    const compressed = zip.subarray(dataStart, dataStart + compressedSize)
    let data
    if (method === STORED) {
      data = compressed
    } else if (method === DEFLATED) {
      data = zlib.inflateRawSync(compressed)
    } else {
      throw new Error(`${fullName} is compressed in a way this script can't read (method ${method})`)
    }
    files.push({ name: fullName.split('/').slice(1).join('/'), data })
  }

  return files
}

function write(files, copy) {
  const isFolder = copy.from.endsWith('/')
  const matching = files.filter((file) => isFolder ? file.name.startsWith(copy.from) : file.name === copy.from)
  if (matching.length === 0) {
    throw new Error(`there is no ${copy.from} in the zip`)
  }
  // the same as `rsync --delete`: files that are gone from the library are gone from the copy too
  fs.rmSync(copy.to, { recursive: true, force: true })
  for (const file of matching) {
    const target = isFolder ? path.join(copy.to, file.name.slice(copy.from.length)) : copy.to
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, file.data)
  }
  return matching.length
}

async function permissionIsGiven() {
  if (process.argv.includes('--yes')) {
    return true
  }
  console.log('The dev tools need these libraries, which will be downloaded from GitHub:\n')
  for (const library of LIBRARIES) {
    console.log(`  ${library.name.padEnd(6)} ${library.zip}`)
  }
  console.log('\nThey replace these folders, which are not in git:\n')
  for (const library of LIBRARIES) {
    for (const copy of library.copies) {
      console.log(`  ${path.relative(projectRoot, copy.to)}`)
    }
  }
  console.log('')
  if (!process.stdin.isTTY) {
    console.log('Nobody can answer here, so nothing is downloaded. Run it again with --yes to download without asking.')
    return false
  }
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await prompt.question('Is it okay to download them? [y/N] ')
  prompt.close()
  return /^y(es)?$/i.test(answer.trim())
}

if (!(await permissionIsGiven())) {
  console.log('Nothing was downloaded.')
  process.exit(1)
}

for (const library of LIBRARIES) {
  process.stdout.write(`Downloading ${library.name}... `)
  const response = await fetch(library.zip)
  if (!response.ok) {
    console.log('')
    throw new Error(`${library.zip} answered ${response.status}`)
  }
  const files = filesInZip(Buffer.from(await response.arrayBuffer()))
  const written = library.copies.reduce((count, copy) => count + write(files, copy), 0)
  console.log(`${written} files`)
}
