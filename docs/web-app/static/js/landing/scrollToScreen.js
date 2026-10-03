/*
Smooth, one move at a time, unless the reader asked for less movement. The page
deliberately has no `scroll-behavior: smooth` (see landing.css): against
mandatory snapping it fights fragment navigation, so moving between screens is
smoothed here, where it is asked for one move at a time.

Returns false when there is no such screen, so a link can fall back to being
an ordinary link.
*/
export default function scrollToScreen(id) {
  const screen = document.getElementById(id)
  if (!screen) {
    return false
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  screen.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  return true
}
