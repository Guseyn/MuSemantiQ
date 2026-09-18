#!/usr/bin/env node
import { symlinkSync, existsSync, readdirSync, rmSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const projectRoot = resolve(__dirname, '..')
const staticDirs = [
  join(projectRoot, 'examples/browser/web-app/static'),
  join(projectRoot, 'dev-tools/web-app/static')
]
const srcDir = join(projectRoot, 'src')

/**
 * Create or update a symlink
 * @param {string} symlinkPath - Full path where the symlink should be created
 * @param {string} targetPath - Path the symlink should point to (can be relative)
 * @param {string} description - Description for logging
 */
function createSymlink(symlinkPath, targetPath, description) {
  try {
    // Remove existing symlink or file (check with lstat to detect broken symlinks)
    try {
      const stats = existsSync(symlinkPath) || true
      if (stats) {
        rmSync(symlinkPath, { force: true, recursive: false })
      }
    } catch (e) {
      // File doesn't exist, continue
    }

    // Create symlink
    symlinkSync(targetPath, symlinkPath)
    console.log(`✓ Created symlink: ${description}`)
  } catch (error) {
    console.error(`✗ Failed to create symlink for ${description}:`, error.message)
    process.exit(1)
  }
}

/**
 * The rendered sample sets, one directory each. `.gitinfo` and the like are not
 * sets, so only directories count.
 */
function soundBanksIn(directory) {
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

console.log('Setting up symlinks for the browser apps...\n')

// The font files themselves are never copied — each app's static folder points
// at the one place they live.
const drawerFontDir = join(srcDir, 'drawer/font')

// The rendered Magenta sample sets, likewise: ~184 MB per soundbank that takes
// hours to build, so both apps play the one copy.
const magentaSoundFontDir = join(srcDir, 'midi/magenta-sound-font')

for (const staticDir of staticDirs) {
  const fontDir = join(staticDir, 'font')
  if (!existsSync(staticDir)) {
    continue
  }

  // The wordmark, which the README shows and both apps put in their header —
  // linked rather than copied, so there is one logo to change.
  const imagesDir = join(staticDir, 'images')
  mkdirSync(imagesDir, { recursive: true })
  createSymlink(
    join(imagesDir, 'logo.svg'),
    join(projectRoot, 'logo.svg'),
    `${staticDir.replace(projectRoot + '/', '')}/images/logo.svg → logo.svg`
  )

  mkdirSync(fontDir, { recursive: true })
  for (const family of [ 'chord-letters', 'music', 'text' ]) {
    createSymlink(
      join(fontDir, family),
      join(drawerFontDir, family),
      `${staticDir.replace(projectRoot + '/', '')}/font/${family} → src/drawer/font/${family}`
    )
  }

  // One link per soundbank rather than one for the folder, the same way the
  // font families are linked: the static folder stays a real directory, and a
  // set rendered later is picked up by running this again.
  mkdirSync(magentaSoundFontDir, { recursive: true })
  const soundFontDir = join(staticDir, 'magenta-sound-font')
  mkdirSync(soundFontDir, { recursive: true })
  for (const soundBank of soundBanksIn(magentaSoundFontDir)) {
    createSymlink(
      join(soundFontDir, soundBank),
      join(magentaSoundFontDir, soundBank),
      `${staticDir.replace(projectRoot + '/', '')}/magenta-sound-font/${soundBank}` +
        ` → src/midi/magenta-sound-font/${soundBank}`
    )
  }
  /*
  A set deleted by hand would otherwise leave its link behind pointing at
  nothing, and the app would go on offering a soundbank that cannot be played.
  Only links are removed, and only ones whose target is gone.
  */
  for (const entry of readdirSync(soundFontDir, { withFileTypes: true })) {
    const at = join(soundFontDir, entry.name)
    if (entry.isSymbolicLink() && !existsSync(at)) {
      rmSync(at, { force: true })
      console.log(`✓ Removed a link to a set that is gone: ${entry.name}`)
    }
  }
}

console.log('\n✓ All symlinks created successfully!')
