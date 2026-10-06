/*
Every heading of a page as e-ui's <h… is="e-h">, and every heading below the
title with a share link in front of its text (js/docs/e-h.js copies it).

The markup is written here, on the way out of showdown, rather than added by
an element when the heading connects: a customized built-in extends exactly
one tag, and the headings are six. A heading written as raw HTML in a page is
given the same, and one that already has the link is left as it is.

The icon is Google's Material Symbols share (Apache License 2.0).
*/
export const shareIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M686-80q-47.5 0-80.75-33.25T572-194q0-8 5-34L278-403q-16.28 17.34-37.64 27.17Q219-366 194-366q-47.5 0-80.75-33.25T80-480q0-47.5 33.25-80.75T194-594q24 0 45 9.3 21 9.29 37 25.7l301-173q-2-8-3.5-16.5T572-766q0-47.5 33.25-80.75T686-880q47.5 0 80.75 33.25T800-766q0 47.5-33.25 80.75T686-652q-23.27 0-43.64-9Q622-670 606-685L302-516q3 8 4.5 17.5t1.5 18q0 8.5-1 16t-3 15.5l303 173q16-15 36.09-23.5 20.1-8.5 43.07-8.5Q734-308 767-274.75T800-194q0 47.5-33.25 80.75T686-80Zm.04-60q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5Zm-492-286q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5Zm492-286q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5ZM686-194ZM194-480Zm492-286Z"/></svg>'

const heading = /<h([1-6])\b([^>]*)>(?!\s*<a data-share)/g

function shareLink(id) {
  return `<a href="#${id}" data-share title="Copy a link to this section" aria-label="Copy a link to this section">${shareIcon}</a>`
}

export default function eHeadingExtension() {
  return [
    {
      type: 'output',
      filter: (html) => html.replace(heading, (whole, level, attributes) => {
        const withIs = /\bis=/.test(attributes) ? attributes : ` is="e-h"${attributes}`
        const id = (/\bid="([^"]+)"/.exec(attributes) || [])[1]
        const link = id && level !== '1' ? shareLink(id) : ''
        return `<h${level}${withIs}>${link}`
      })
    }
  ]
}
