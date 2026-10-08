'use strict'

import {  parseSync, stringify  } from 'svgson.js'
import SvgPathProperties from 'svg-path-properties.js'.svgPathProperties

const IGNORE_CHILDREN_ELEMENTS_OF_ELEMENTS_WITH_DATA_NAME = [ 'stavePiece', 'stavesPiece', 'startBarLine', 'startBoldDoubleBarLine', 'barLine', 'boldDoubleBarLine', 'dottedBarLine', 'doubleBarLine' ]

// based on this solution: https://github.com/cheng500/svg-path-animator/blob/master/cli.js

const KEY_FRAMES_ANIMATIONS = '@keyframes drawStroke{to{stroke-dashoffset: 0;}} @keyframes fillIn{to{fill-opacity: 1}};'

const withAnimationStyle = (element, options, strokeLineLenght, drawStroke, fillIn) => {
  if (drawStroke && fillIn) {
    return `${element.attributes.style ? element.attributes.style + '; ' : ''}stroke-dasharray:${strokeLineLenght}; stroke-dashoffset:${strokeLineLenght}; fill-opacity: 0; animation: fillIn ${options.durationForFillIn}ms ${options.timing} ${options.delayForFillIn}ms ${options.iteration} ${options.direction}, drawStroke ${options.durationForDrawingStroke}ms ${options.timing} ${options.delayForDrawingStroke}ms ${options.iteration} ${options.direction};`
  }
  if (drawStroke) {
    return `${element.attributes.style ? element.attributes.style + '; ' : ''}stroke-dasharray:${strokeLineLenght}; stroke-dashoffset:${strokeLineLenght}; drawStroke ${options.durationForDrawingStroke}ms ${options.timing} ${options.delayForDrawingStroke}ms ${options.iteration} ${options.direction};`
  }
  if (fillIn) {
    return `fill-opacity: 0; animation: fillIn ${options.durationForFillIn}ms ${options.timing} ${options.delayForFillIn}ms ${options.iteration} ${options.direction};`
  }
  return ''
}

const addAnimationToElement = (element, options, styles) => {
  let length = 0
  if (IGNORE_CHILDREN_ELEMENTS_OF_ELEMENTS_WITH_DATA_NAME.indexOf(element.attributes['data-name']) === -1) {
    switch (element.name) {
      case 'circle':
        length = 2 * Math.PI * element.attributes.r
        element.attributes.style = withAnimationStyle(element, options, length, false, true)
        break
      case 'rect':
        const itIsNotPageBackground = element.attributes['data-name'] !== 'page-background'
        length = Math.ceil(element.attributes.width * 2 + element.attributes.height * 2)
        element.attributes.style = withAnimationStyle(element, options, length, itIsNotPageBackground, itIsNotPageBackground)
        break
      case 'path':
        const pathProperties = new SvgPathProperties(element.attributes.d)
        length = Math.ceil(pathProperties.getTotalLength())
        element.attributes.style = withAnimationStyle(element, options, length, true, true)
        break
      case 'polygon':
      case 'polyline':
        const helper = element.attributes.points.split(' ')
        let points = []
        if (element.attributes.points.indexOf(',') >= 0) {
          for (let i = 0; i < helper.length; i++) {
            points[i] = helper[i].split(',')
          }
        } else {
          for (let i = 0; i < helper.length; i += 2) {
            let arr = []
            for (let j = 0; j < 2; j++) {
              arr.push(helper[i + j])
            }
            points.push(arr)
          }
        }

        let res = ''
        for (let i = 0; i < points.length; i++) {
          res += ((i && 'L') || 'M') + points[i]
        }
        res = `${res}z`
        const polyProperties = new SvgPathProperties(res)
        length = Math.ceil(polyProperties.getTotalLength())
        element.attributes.style = withAnimationStyle(element, options, length, true, true)
        break
      case 'line':
        const x1 = element.attributes.x1 || 0
        const x2 = element.attributes.x2 || 0
        const y1 = element.attributes.y1 || 0
        const y2 = element.attributes.y2 || 0
        length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
        element.attributes.style = withAnimationStyle(element, options, length, true, true)
        break
      default:
        for (let i = 0; i < element.children.length; i++) {
          addAnimationToElement(element.children[i], options, styles)
        }
        break
    }
  }
}

export default function (svgAsString, options = {}, styles) {
  options.iteration = options.iteration || '1'
  options.direction = options.direction || 'forwards'
  options.timing = options.timing || 'linear'
  options.delayForDrawingStroke = options.delayForDrawingStroke || 100
  options.durationForDrawingStroke = options.durationForDrawingStroke || 2500
  options.delayForFillIn = options.delayForFillIn || 2650
  options.durationForFillIn = options.durationForFillIn || 1500
  const svgAsJson = parseSync(svgAsString)
  const root = svgAsJson
  const styleIndex = root.children.findIndex((element) => element.name === 'style')
  if (styleIndex >= 0) {
    root.children[styleIndex].children.unshift(
      {
        name: '',
        type: 'text',
        value: KEY_FRAMES_ANIMATIONS,
        attributes: {},
        children: []
      }
    )
  } else {
    root.children = [{
      name: 'style',
      type: 'element',
      value: '',
      attributes: { type: 'text/css' },
      children: [{
        name: '',
        type: 'text',
        value: KEY_FRAMES_ANIMATIONS,
        attributes: {},
        children: []
      }]
    }, ...root.children]
  }
  addAnimationToElement(root, options, styles)
  return stringify(root)
}
