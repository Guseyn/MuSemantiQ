#!/usr/bin/env node

/*
Makes a release from your machine.

    npm run release
    npm run release -- --dry-run    shows what would happen, changes nothing

It asks what goes into the changelog and what kind of release it is, then:

  1. sets the new version in package.json
  2. adds the changes to the top of CHANGELOG.md
  3. commits both and tags the commit (v1.2.3)
  4. pushes the commit and the tag
  5. creates a GitHub release with your changes and every commit since the
     previous tag

It needs a clean working tree, because the release commit must contain only the
version and the changelog. It also needs `gh`, logged in.
*/

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'
import { select } from '../cli-app/lib/select.js'
import { pasteBlock } from '../cli-app/lib/paste.js'
import { isAbort } from '../cli-app/lib/errors.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const packageJsonPath = path.join(projectRoot, 'package.json')
const changelogPath = path.join(projectRoot, 'CHANGELOG.md')
const isDryRun = process.argv.includes('--dry-run')

const run = (command, args, input) => execFileSync(command, args, {
  cwd: projectRoot,
  encoding: 'utf-8',
  input,
  stdio: [ input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe' ]
}).trim()
const git = (...args) => run('git', args)

function fail(message) {
  console.error(message)
  process.exit(1)
}

function checkThatReleaseIsPossible() {
  try {
    run('gh', [ 'auth', 'status' ])
  } catch {
    fail('gh is not installed or not logged in. Run `gh auth login` first.')
  }
  if (git('status', '--porcelain') !== '') {
    fail('The working tree has changes. Commit or stash them first.')
  }
  const branch = git('branch', '--show-current')
  git('fetch', '--quiet', 'origin', branch)
  const [ behind ] = git('rev-list', '--left-right', '--count', `origin/${branch}...HEAD`).split(/\s+/)
  if (Number(behind) > 0) {
    fail(`${branch} is ${behind} commits behind origin/${branch}. Pull first.`)
  }
  return branch
}

function previousTag() {
  try {
    return git('describe', '--tags', '--abbrev=0')
  } catch {
    // there is no tag yet, so the release has every commit
    return null
  }
}

function nextVersion(version, type) {
  const [ major, minor, patch ] = version.split('.').map(Number)
  if (type === 'major') {
    return `${major + 1}.0.0`
  }
  if (type === 'minor') {
    return `${major}.${minor + 1}.0`
  }
  return `${major}.${minor}.${patch + 1}`
}

// the version line is replaced as text, so the rest of package.json keeps its formatting
function setVersionInPackageJson(text, version) {
  return text.replace(/("version":\s*")[^"]+(")/, `$1${version}$2`)
}

function addToChangelog(text, version, date, changes) {
  const entry = `## ${version} (${date})\n\n${changes}\n`
  if (!text) {
    return `# Changelog\n\n${entry}`
  }
  const firstEntry = text.indexOf('\n## ')
  if (firstEntry === -1) {
    return `${text.trimEnd()}\n\n${entry}`
  }
  return `${text.slice(0, firstEntry + 1)}${entry}\n${text.slice(firstEntry + 1)}`
}

function commitsSince(tag) {
  const range = tag ? [ `${tag}..HEAD` ] : []
  const log = git('log', ...range, '--format=%h %s')
  return log === '' ? [] : log.split('\n')
}

function releaseNotes(changes, commits, tag, newTag, repository) {
  const lines = [ changes, '', '## Commits', '' ]
  for (const commit of commits) {
    lines.push(`- ${commit}`)
  }
  if (tag) {
    lines.push('', `**Full changelog**: https://github.com/${repository}/compare/${tag}...${newTag}`)
  }
  return lines.join('\n')
}

async function main() {
  const branch = checkThatReleaseIsPossible()
  const tag = previousTag()
  const commits = commitsSince(tag)
  if (commits.length === 0) {
    fail(`There are no commits since ${tag}.`)
  }
  console.log(`${commits.length} commits since ${tag || 'the beginning'}.\n`)

  const changes = (await pasteBlock({ message: 'What goes into the changelog?' })).trim()
  if (changes === '') {
    fail('The changelog can\'t be empty.')
  }

  const packageJsonText = fs.readFileSync(packageJsonPath, 'utf-8')
  const version = JSON.parse(packageJsonText).version
  const type = await select({
    message: `What kind of release? (now ${version})`,
    choices: [ 'patch', 'minor', 'major' ].map((type) => ({
      label: type,
      value: type,
      hint: nextVersion(version, type)
    }))
  })
  const newVersion = nextVersion(version, type)
  const newTag = `v${newVersion}`
  const date = new Date().toISOString().slice(0, 10)
  const repository = run('gh', [ 'repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner' ])
  const notes = releaseNotes(changes, commits, tag, newTag, repository)
  const changelogText = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf-8') : ''

  console.log(`\n${newTag} on ${branch}, released to ${repository}:\n\n${notes}\n`)
  if (isDryRun) {
    console.log('This was a dry run, so nothing was changed.')
    return
  }

  const isConfirmed = await select({
    message: `Commit, tag and push ${newTag}, and create the GitHub release?`,
    choices: [ { label: 'no', value: false }, { label: 'yes', value: true } ]
  })
  if (!isConfirmed) {
    console.log('Nothing was changed.')
    return
  }

  fs.writeFileSync(packageJsonPath, setVersionInPackageJson(packageJsonText, newVersion))
  fs.writeFileSync(changelogPath, addToChangelog(changelogText, newVersion, date, changes))
  git('add', 'package.json', 'CHANGELOG.md')
  git('commit', '--quiet', '-m', `Release ${newTag}`)
  git('tag', '-a', newTag, '-m', newTag)
  console.log(`Committed and tagged ${newTag}.`)

  try {
    git('push', '--quiet', 'origin', branch)
    git('push', '--quiet', 'origin', newTag)
  } catch (error) {
    fail(`The push failed, so the release was not created:\n${error.stderr || error.message}\nThe commit and the tag are local. Push them with \`git push origin ${branch} ${newTag}\`, then run \`gh release create ${newTag}\`.`)
  }
  console.log('Pushed.')

  const url = run('gh', [ 'release', 'create', newTag, '--title', newTag, '--notes-file', '-' ], notes)
  console.log(`Released: ${url}`)
}

try {
  await main()
} catch (error) {
  if (isAbort(error)) {
    console.error('\nCancelled. Nothing was changed.')
    process.exitCode = 130
  } else {
    throw error
  }
}
