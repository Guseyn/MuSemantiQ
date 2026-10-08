'use strict'

export default function (str) { return str.replace(/(\s){2,}/g, ' ').trim() }
