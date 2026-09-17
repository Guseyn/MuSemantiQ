/**
 * Colours for the syntax-highlight spans emitted in `highlightsHtmlBuffer`.
 *
 * The class names are deliberately 2-5 letters because they are produced once
 * per token and the buffer is joined straight into innerHTML:
 *
 *   ch    comment                 sh    style command
 *   svh   style value             msh   midi setting
 *   msvh  midi setting value      th    plain text / wrapper
 *   eh    element keyword         sth   quoted string
 *   cnh   contains number         nrch  not-recognizable command
 *   clph  line position           cmph  measure position
 *   csph  stave position          cvph  voice position
 *   cuph  unit position
 *   *pph  the preposition in front of the matching position
 */
export default /*css*/`
  .ch { color: var(--muted-font-color); }
  .sh,
  .svh { color: #a01a4c; }
  .msh,
  .msvh { color: #3c5e93; }
  .eh { color: #0087bd; }
  .sth { color: #00744e; }
  .cnh { color: #8f0125; }

  .clph { color: #009f6b; }
  .cmph { color: #832e61; }
  .csph { color: #e26b1a; }
  .cvph { color: #008fa2; }
  .cuph { color: #c40233; }

  .th,
  .clpph,
  .cmpph,
  .cspph,
  .cvpph,
  .cupph { color: var(--editor-font-color); }

  .nrch {
    color: var(--editor-font-color);
    text-decoration: underline;
    text-decoration-color: #dd4444;
    text-decoration-style: wavy;
    text-decoration-skip-ink: none;
    text-underline-offset: 0.2em;
  }
`
