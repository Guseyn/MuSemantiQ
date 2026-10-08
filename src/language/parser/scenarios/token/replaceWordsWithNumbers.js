'use strict'

const NUMBERS_WITH_POSTFIX = [
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th',
  '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th',
  '21st', '22nd', '23rd', '24th', '25th', '26th', '27th', '28th', '29th', '30th',
  '31st', '32nd', '33rd', '34th', '35th', '36th', '37th', '38th', '39th', '40th',
  '41st', '42nd', '43rd', '44th', '45th', '46th', '47th', '48th', '49th', '50th',
  '51st', '52nd', '53rd', '54th', '55th', '56th', '57th', '58th', '59th', '60th',
  '61st', '62nd', '63rd', '64th', '65th', '66th', '67th', '68th', '69th', '70th',
  '71st', '72nd', '73rd', '74th', '75th', '76th', '77th', '78th', '79th', '80th',
  '81st', '82nd', '83rd', '84th', '85th', '86th', '87th', '88th', '89th', '90th',
  '91st', '92nd', '93rd', '94th', '95th', '96th', '97th', '98th', '99th', '100th'
]

const mapOfWordsAndNumbers = {
  'first': '1',
  'second': '2',
  'third': '3',
  'fourth': '4',
  'fifth': '5',
  'sixth': '6',
  'seventh': '7',
  'eighth': '8',
  'ninth': '9',
  'tenth': '10',
  'one': '1',
  'two': '2',
  'three': '3',
  'four': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8',
  'nine': '9',
  'ten': '10'
}

export default function (tokenValues, joinedTokenValues) {
  return tokenValues.map(tokenValue => {
    const tokenValueLength = tokenValue.length
    if (NUMBERS_WITH_POSTFIX.indexOf(`${tokenValue[tokenValueLength - 3]}${tokenValue[tokenValueLength - 2]}${tokenValue[tokenValueLength - 1]}`) !== -1) {
      tokenValue = tokenValue.slice(0, tokenValueLength - 2)
    } else if (NUMBERS_WITH_POSTFIX.indexOf(`${tokenValue[tokenValueLength - 4]}${tokenValue[tokenValueLength - 3]}${tokenValue[tokenValueLength - 2]}${tokenValue[tokenValueLength - 1]}`) !== -1) {
      tokenValue = tokenValue.slice(0, tokenValueLength - 2)
    }
    return mapOfWordsAndNumbers[tokenValue] || tokenValue
  })
}
