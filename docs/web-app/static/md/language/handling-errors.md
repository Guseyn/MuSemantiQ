# Handling errors

> **TO WRITE**
> - that the parser never throws — it accumulates errors and draws everything it understood
> - the shape of an error string, and that it carries a line number
> - the common ones: an unrecognisable command, a unit a span names that does not exist, an endpoint with no position
> - how the editor shows them, and how to read them out of the API

<!-- check-docs-examples: allow-errors -->
<div>
<template is="msq-svg" data-font-sources="msqFontSources">
measure
treble clef
c d e f

stave with fancy clef
</template>
</div>
