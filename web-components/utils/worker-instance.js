/**
 * The one worker every component talks to.
 *
 * These components are copied into an app's static folder whole, and the engine
 * is generated beside the folder as `worker/`:
 *
 *   <app>/static/js/msq/web-components/   ← this
 *   <app>/static/js/msq/worker/           ← the engine
 *
 * so the worker is always two directories up from a module one level inside,
 * whatever URL the pair is mounted at. Resolving it against this module's own
 * URL is what keeps them movable: neither half has to be told where the other
 * landed, and nothing here names an absolute path.
 */
const worker = new Worker(
  new URL('../../worker/worker.js', import.meta.url),
  { type: 'module' }
)

export default worker
