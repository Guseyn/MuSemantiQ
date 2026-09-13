#!/usr/bin/env node
import { symlinkSync, existsSync, rmSync, mkdirSync } from 'fs'
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

console.log('Setting up font symlinks for the browser apps...\n')

// The font files themselves are never copied — each app's static folder points
// at the one place they live.
const drawerFontDir = join(srcDir, 'drawer/font')

for (const staticDir of staticDirs) {
  const fontDir = join(staticDir, 'font')
  if (!existsSync(staticDir)) {
    continue
  }
  mkdirSync(fontDir, { recursive: true })
  for (const family of [ 'chord-letters', 'music', 'text' ]) {
    createSymlink(
      join(fontDir, family),
      join(drawerFontDir, family),
      `${staticDir.replace(projectRoot + '/', '')}/font/${family} → src/drawer/font/${family}`
    )
  }
}

console.log('\n✓ All symlinks created successfully!')
