/**
 * Opens a data: URL in a new tab. Browsers block navigating straight to a
 * data: URL, so round-trip it through a blob first.
 */
export default async function openContent({ dataSrc }) {
  try {
    const response = await fetch(dataSrc)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  } catch (error) {
    console.error('Error opening SVG:', error)
  }
}
