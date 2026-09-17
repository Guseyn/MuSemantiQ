export default (keyCode) => {
  return (
    (keyCode >= 48 && keyCode <= 57) || // 0-9
    (keyCode >= 65 && keyCode <= 90) || // a-z
    (keyCode >= 96 && keyCode <= 111) || // numpad 0-9, numeric operators
    (keyCode >= 186 && keyCode <= 222) || // semicolon, equal, comma, dash, etc.
    keyCode === 32 || // space
    keyCode === 8 || // backspace
    keyCode === 46 || // delete
    keyCode === 13 // enter
  )
}
