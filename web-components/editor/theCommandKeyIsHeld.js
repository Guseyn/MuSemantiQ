/**
 * Whether the command modifier is down: Cmd on macOS, Ctrl everywhere else.
 *
 * The two are not interchangeable — Ctrl on a Mac opens the context menu, and
 * Cmd on Windows is the Windows key — so the editor picks one by platform and
 * every shortcut asks the same question here rather than spelling the test out
 * again.
 *
 * `navigator.platform` is deprecated in favour of `userAgentData`, which Safari
 * and Firefox do not implement; it is also the only one of the two that is
 * reliably present, so it stays as the fallback rather than the other way
 * round.
 */
const isMacOS = (() => {
  const brands = navigator.userAgentData
  if (brands && typeof brands.platform === 'string') {
    return brands.platform === 'macOS'
  }
  return navigator.platform.indexOf('Mac') !== -1
})()

export { isMacOS }

export default function theCommandKeyIsHeld(event) {
  return isMacOS ? event.metaKey : event.ctrlKey
}
