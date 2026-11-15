'use strict'

const asciiLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const asciiDigits = '0123456789'
const asciiPunctuationAndSpace = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
const accentedLatinLetters = 'ÀÁÂÄÇÈÉÊËÌÍÎÏÑÒÓÔÖÙÚÛÜÝàáâäçèéêëìíîïñòóôöùúûüýÆæŒœßẞŸÿ'
const russianCyrillicLetters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя'
const typographicPunctuationAndSpaces = '¡¿«»‹›„“”‘’‚–—…\u00A0\u202F'

// Array.from iterates Unicode code points, so adding a supplementary character
// later cannot silently turn one alphabet entry into two surrogate halves.
const characters = Array.from(
  asciiLetters +
  asciiDigits +
  asciiPunctuationAndSpace +
  accentedLatinLetters +
  russianCyrillicLetters +
  typographicPunctuationAndSpaces
)

if (new Set(characters).size !== characters.length) {
  throw new Error('The text OCR alphabet contains duplicate characters')
}

export const textOcrAlphabet = Object.freeze(characters)

export default textOcrAlphabet
