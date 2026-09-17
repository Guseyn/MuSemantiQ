export default function downloadContent({ fileName, dataSrc, extenstion }) {
  const anchor = document.createElement('a')
  anchor.href = dataSrc
  anchor.download = `${fileName}.${extenstion}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}
