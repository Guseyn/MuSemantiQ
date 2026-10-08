'use strict'

export default function (left1, top1, left2, top2) {
  const gradient = (top1 - top2) / (left1 - left2)
  const topIntercept = top1 - gradient * left1
  return {
    gradient,
    topIntercept
  }
}
