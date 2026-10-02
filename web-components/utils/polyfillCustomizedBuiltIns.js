/*
Every msq element is a customized built-in — a <template is="msq-…"> — and
WebKit does not implement those: in Safari the template is never upgraded, so it
never renders. The polyfill in lib/ (the one EHTML carries, by Andrea
Giammarchi) fills that in, but only if it runs before the first
customElements.define. msq-template.js imports this first thing, and every
element imports msq-template.js before it defines itself, so a page gets it just
by importing the elements.

The polyfill has no guard against running twice, and in WebKit a second run
wraps customElements.define again over the first. A page that loads EHTML has
usually run EHTML's copy already, from a different URL, so the module cache
would not stop it. What a run leaves behind is a define that is no longer native
code, so that is what is checked. In Chromium and Firefox define stays native,
and the polyfill finds nothing to do there and returns.
*/
const defineIsNative = /\[native code\]/.test(
  Function.prototype.toString.call(customElements.define)
)

if (defineIsNative) {
  await import('#msq/web-components/lib/custom-elements-polyfill.js')
}
