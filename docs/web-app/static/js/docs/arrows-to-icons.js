/*
Mermaid draws a node written as node@{ icon: …, label: … } as the icon with its
label under it, and aims every arrow at the middle of the two together, which is
the gap between them: an arrow stops at the side of the label, level with the
bottom of the icon, and a wide label leaves it well short of the icon it means.

There is no setting for it, so once a diagram is drawn this moves each icon onto
that middle, with its label under it, and the ends of every arrow onto the icon,
each end pulled in along its own last stretch so the curve keeps its shape.
*/

// Room left between an arrow and its icon; at the end the head reaches past the line, so more
const GAP_AT_START = 4
const GAP_AT_END = 8

function translation(element) {
  const match = (element.getAttribute('transform') || '').match(/translate\(\s*([-\d.e]+)[\s,]+([-\d.e]+)\s*\)/)
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 0, y: 0 }
}

function movedDown(element, by) {
  element.setAttribute('transform', `translate(0,${by}) ${element.getAttribute('transform') || ''}`)
}

/*
An icon node holds, in order: an empty square where the icon goes, the label, an
invisible box around both (what Mermaid lays out and clips arrows against), and
the icon itself. The box is left where it is, so the layout does not change.
*/
function iconMovedToTheMiddle(node) {
  const position = translation(node)
  const box = node.getBBox()
  const icon = node.lastElementChild
  const iconBox = icon.getBBox()
  const iconTop = translation(icon).y + iconBox.y
  const by = -(iconTop + iconBox.height / 2)
  const square = node.firstElementChild
  const label = node.querySelector(':scope > g.label')
  for (const element of [ square, icon, label ]) {
    if (element) {
      movedDown(element, by)
    }
  }
  // An arrow that still has to pass a label goes behind it rather than through the words
  const words = label && label.querySelector('foreignObject > div')
  if (words) {
    words.style.backgroundColor = 'var(--docs-block-bg, #ffffff)'
  }
  return {
    x: position.x,
    y: position.y,
    halfWidth: box.width / 2,
    halfHeight: box.height / 2,
    halfIcon: iconBox.width / 2,
    bottom: position.y + box.y + box.height + by
  }
}

// An arrow stops short of the box it points at, by the length of its head, so the box is looked for a little wider
const REACH = 12

function iconAt(icons, x, y) {
  return icons.find((icon) => Math.abs(x - icon.x) <= icon.halfWidth + REACH && Math.abs(y - icon.y) <= icon.halfHeight + REACH)
}

// Where the line from the middle of the icon towards (towardX, towardY) leaves the square around it
function pointOnIcon(icon, towardX, towardY, gap) {
  const dx = towardX - icon.x
  const dy = towardY - icon.y
  const longest = Math.max(Math.abs(dx), Math.abs(dy)) || 1
  const reach = icon.halfIcon + gap
  return [ icon.x + dx * reach / longest, icon.y + dy * reach / longest ]
}

export default function arrowsToIcons(svg) {
  /*
  The title of a frame sits where arrows come into it from above. Frames are
  drawn before arrows, so each title is moved after them, into the same group
  (frames have no offset of their own). It gets a glow the colour of the card
  rather than a background: a background reaches up over the frame's border.
  */
  for (const title of svg.querySelectorAll('g.cluster-label')) {
    const frames = title.closest('g.clusters')
    if (frames && frames.parentNode) {
      frames.parentNode.appendChild(title)
    }
    const words = title.querySelector('foreignObject > div')
    if (words) {
      const glow = 'var(--docs-block-bg, #ffffff)'
      words.style.textShadow = `0 0 2px ${glow}, 0 0 3px ${glow}, 0 0 4px ${glow}, 0 0 6px ${glow}`
    }
  }
  const icons = [ ...svg.querySelectorAll('g.icon-shape') ].map(iconMovedToTheMiddle)
  if (icons.length === 0) {
    return
  }
  for (const path of svg.querySelectorAll('path[data-edge]')) {
    const numbers = (path.getAttribute('d').match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number)
    if (numbers.length < 4) {
      continue
    }
    const last = numbers.length - 2
    const from = iconAt(icons, numbers[0], numbers[1])
    if (from) {
      [ numbers[0], numbers[1] ] = pointOnIcon(from, numbers[2], numbers[3], GAP_AT_START)
    }
    const to = iconAt(icons, numbers[last], numbers[last + 1])
    if (to) {
      [ numbers[last], numbers[last + 1] ] = pointOnIcon(to, numbers[last - 2], numbers[last - 1], GAP_AT_END)
    }
    let index = 0
    path.setAttribute('d', path.getAttribute('d').replace(/-?\d*\.?\d+(?:e-?\d+)?/g, () => {
      const number = numbers[index++]
      return String(Math.round(number * 1000) / 1000)
    }))
  }
  // A label now hangs lower than the box Mermaid made room for, so the drawing grows to keep it
  const viewBox = svg.viewBox.baseVal
  const lowest = Math.max(...icons.map((icon) => icon.bottom))
  if (viewBox && lowest > viewBox.y + viewBox.height) {
    const height = lowest - viewBox.y + 8
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${height}`)
    if (svg.hasAttribute('height')) {
      svg.setAttribute('height', String(height))
    }
  }
}
