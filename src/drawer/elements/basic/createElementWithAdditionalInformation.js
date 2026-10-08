'use strict'

export default function (group, additionalInformation) {
  return { ...group, ...additionalInformation }
}
