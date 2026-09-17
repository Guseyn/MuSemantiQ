import canvasFontFromTextarea from '#msq/editor/canvasFontFromTextarea.js'

export default (textarea, text) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = canvasFontFromTextarea(textarea)
  const metrics = context.measureText(text)
  return metrics.width
}
