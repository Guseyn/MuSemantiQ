# Regenerates dev-docs/math-figures/*.svg — every graph of dev-docs/omr-math.html.
# Curves are computed from their formulas, labels use plotmath, so the figures
# are as precise as the math they show. Frames replace the old SMIL animation.
# Run: Rscript scripts/generate-math-figures.R

out <- "dev-docs/math-figures"
dir.create(out, showWarnings = FALSE, recursive = TRUE)
status <- system2("node", "scripts/render-omr-examples.js")
if (status != 0) stop("Could not render the OMR example pages")

# ── the paper palette of the docs ──
ink <- "#17181a"; muted <- "#6b7076"; rule <- "#e4e4e0"; soft <- "#f4f3ef"
accent <- "#a5322a"; accent_soft <- "#f6e9e6"; ok <- "#2f6b3c"; ok_soft <- "#e2f0e4"
# Latin Modern is the Computer Modern the page's KaTeX sets its math in;
# cairo bakes the glyphs into the svg, so viewers need no such font
mathfont <- "NewComputerModern10"

# one user unit is one hundredth of an inch; cex 1 is the 12px label size
marks <- list(); fig_w <- 0; fig_h <- 0

open_fig <- function(name, w, h) {
  marks <<- list(); fig_w <<- w; fig_h <<- h
  fig_file <<- file.path(out, paste0(name, ".svg"))
  svg(fig_file, width = w / 100, height = h / 100, bg = "white")
  par(mar = rep(0, 4), xpd = NA, ps = 12 * 72 / 100, family = mathfont)
  # y grows downward, like the coordinates the figures were designed in
  plot(0, 0, type = "n", xlim = c(0, w), ylim = c(h, 0), axes = FALSE, xlab = "", ylab = "", xaxs = "i", yaxs = "i")
}

# everything drawn is recorded, so check_marks can find collisions
mark_text <- function(x, y, s, adj, size) {
  # strheight is negative on the flipped y axis — boxes normalize or every
  # text-vs-text test comes out inverted and silently false
  w <- abs(strwidth(s, cex = size / 12))
  h <- abs(strheight(s, cex = size / 12)) * 0.72
  marks[[length(marks) + 1]] <<- list(kind = "text", what = paste(deparse(s), collapse = " "),
    x0 = x - adj[1] * w, x1 = x - adj[1] * w + w, y0 = y - adj[2] * h, y1 = y - adj[2] * h + h)
}
mark_box <- function(x0, y0, x1, y1) {
  marks[[length(marks) + 1]] <<- list(kind = "box", x0 = x0, y0 = y0, x1 = x1, y1 = y1)
}
mark_poly <- function(x, y) {
  if (length(x) == 2) {
    n <- max(2, ceiling(sqrt((x[2] - x[1])^2 + (y[2] - y[1])^2) / 4))
    x <- seq(x[1], x[2], length.out = n)
    y <- seq(y[1], y[2], length.out = n)
  }
  marks[[length(marks) + 1]] <<- list(kind = "poly", x = x, y = y)
}

mono <- function(x, y, s, size = 16, col = ink, adj = c(0, 0.5), font = 1) {
  mark_text(x, y, s, adj, size)
  text(x, y, s, adj = adj, cex = size / 12, col = col, font = font)
}
math <- function(x, y, e, size = 18, col = ink, adj = c(0, 0.5)) {
  mark_text(x, y, e, adj, size)
  text(x, y, e, adj = adj, cex = size / 12, col = col)
}
note <- function(x, y, s, adj = c(0, 0.5)) mono(x, y, s, size = 15, col = ink, adj = adj)
# the text face has no ⋅, ⊙ or ≈ — some plotmath operators come out as empty
# boxes. A formula with such an operator is set in pieces, with the operator in
# the math face
mathfont_ops <- "NewComputerModern Math"
pieces <- function(x, y, parts, size = 16, adj = c(0, 0.5)) {
  cex <- size / 12
  fam <- sapply(parts, function(p) if (is.character(p) && p %in% c("⋅", "⊙", "≈")) mathfont_ops else mathfont)
  gap <- abs(strwidth(" ", cex = cex)) * 0.6
  ws <- mapply(function(p, f) abs(strwidth(p, cex = cex, family = f)), parts, fam)
  ws <- ws + ifelse(fam == mathfont_ops, 2 * gap, 0)
  x <- x - adj[1] * sum(ws)
  mark_text(x, y, paste(sapply(parts, function(p) paste(deparse(p), collapse = "")), collapse = " "), c(0, adj[2]), size)
  marks[[length(marks)]]$x1 <<- x + sum(ws)
  for (i in seq_along(parts)) {
    off <- if (fam[i] == mathfont_ops) gap else 0
    text(x + off, y, parts[[i]], adj = c(0, adj[2]), cex = cex, col = ink, family = fam[i])
    x <- x + ws[i]
  }
}

cell <- function(x, y, w, h, fill = soft, border = rule, lwd = 1) {
  mark_box(x, y, x + w, y + h)
  rect(x, y, x + w, y + h, col = fill, border = border, lwd = lwd)
}
hot <- function(x, y, w, h) cell(x, y, w, h, fill = accent_soft, border = accent, lwd = 1.6)
frame <- function(x, y, w, h, border = accent, lwd = 2) {
  mark_box(x, y, x + w, y + h)
  rect(x, y, x + w, y + h, col = NA, border = border, lwd = lwd)
}
arrow <- function(x0, y0, x1, y1, col = muted, lwd = 1.4, lty = 1, length = 0.12) {
  mark_poly(c(x0, x1), c(y0, y1))
  arrows(x0, y0, x1, y1, col = col, lwd = lwd, lty = lty, length = length)
}
flow <- function(x0, y0, x1, y1, ...) arrow(x0, y0, x1, y1, col = accent, lwd = 1.8, ...)
axis_line <- function(x0, y0, x1, y1) arrow(x0, y0, x1, y1, col = muted, lwd = 1.4)
dashed <- function(x0, y0, x1, y1, col = muted) {
  mark_poly(c(x0, x1), c(y0, y1))
  segments(x0, y0, x1, y1, col = col, lwd = 1.4, lty = 2)
}
draw_line <- function(x, y, col = ink, lwd = 2, lty = 1) {
  mark_poly(x, y)
  lines(x, y, col = col, lwd = lwd, lty = lty)
}
dot <- function(x, y, col = accent, cex = 0.9, ring = FALSE) {
  marks[[length(marks) + 1]] <<- list(kind = "dot", x0 = x - 6, x1 = x + 6, y0 = y - 6, y1 = y + 6)
  if (ring) points(x, y, pch = 21, bg = col, col = "white", lwd = 2, cex = cex)
  else points(x, y, pch = 16, cex = cex, col = col)
}
draw_seg <- function(x0, y0, x1, y1, col = muted, lwd = 1.4, lty = 1) {
  n <- max(length(x0), length(y0), length(x1), length(y1))
  x0 <- rep_len(x0, n); y0 <- rep_len(y0, n); x1 <- rep_len(x1, n); y1 <- rep_len(y1, n)
  for (i in seq_len(n)) mark_poly(c(x0[i], x1[i]), c(y0[i], y1[i]))
  segments(x0, y0, x1, y1, col = col, lwd = lwd, lty = lty)
}

check_marks <- function(name) {
  texts <- Filter(function(m) m$kind == "text", marks)
  inside <- function(t, b) t$x0 >= b$x0 && t$x1 <= b$x1 && t$y0 >= b$y0 && t$y1 <= b$y1
  hit <- function(a, b) a$x0 < b$x1 - 2 && b$x0 < a$x1 - 2 && a$y0 < b$y1 - 2 && b$y0 < a$y1 - 2
  for (i in seq_along(texts)) {
    t <- texts[[i]]
    if (t$x0 < -1 || t$x1 > fig_w + 1 || t$y0 < -2 || t$y1 > fig_h + 2)
      cat("OUTSIDE ", name, ": \"", t$what, "\"\n", sep = "")
    if (i < length(texts)) for (j in (i + 1):length(texts)) {
      if (hit(t, texts[[j]])) cat("TEXT-COLLISION ", name, ": \"", t$what, "\" vs \"", texts[[j]]$what, "\"\n", sep = "")
    }
    boxes <- Filter(function(m) m$kind == "box", marks)
    contained <- any(sapply(boxes, function(b) inside(t, b)))
    if (!contained) for (b in boxes) {
      if (hit(t, b)) cat("BOX-COLLISION ", name, ": \"", t$what, "\"\n", sep = "")
    }
    for (m in Filter(function(m) m$kind == "poly", marks)) {
      k <- which(m$x > t$x0 & m$x < t$x1 & m$y > t$y0 & m$y < t$y1)
      k <- k[!is.na(k)]
      if (length(k)) cat("LINE-COLLISION ", name, ": \"", t$what, "\"\n", sep = "")
    }
  }
}

grid_of <- function(x, y, cols, rows, cw, ch, fills = NULL) {
  for (r in seq_len(rows)) for (c in seq_len(cols)) {
    f <- soft
    if (!is.null(fills)) f <- fills[r, c]
    cell(x + (c - 1) * cw, y + (r - 1) * ch, cw, ch, fill = f)
  }
}
value_in <- function(x, y, w, h, s, size = 16, col = ink, font = 1) {
  mono(x + w / 2, y + h / 2, s, size = size, col = col, adj = c(0.5, 0.5), font = font)
}
matrix_grid <- function(x, y, cols, rows, cw, ch) grid_of(x, y, cols, rows, cw, ch)

manifest <- character()
add <- function(index, name) {
  check_marks(name)
  crop_fig(name)
  manifest <<- c(manifest, paste(index, name, sep = "\t"))
}

# the page stretches every figure to its column, so figures drawn at different
# widths came out at different type sizes. Each svg is cropped to what was drawn
# and framed at one common width, centred, so a 15-unit label is the same size
# in every figure and no figure carries empty bands
common_w <- 720; pad <- 22
crop_fig <- function(name) {
  xs <- unlist(lapply(marks, function(m) if (m$kind == "poly") m$x else c(m$x0, m$x1)))
  ys <- unlist(lapply(marks, function(m) if (m$kind == "poly") m$y else c(m$y0, m$y1)))
  x0 <- min(xs) - pad; x1 <- max(xs) + pad; y0 <- min(ys) - pad; y1 <- max(ys) + pad
  w <- max(common_w, x1 - x0); cx <- (x0 + x1) / 2
  vb <- c(cx - w / 2, y0, w, y1 - y0) * 0.72
  f <- file.path(out, paste0(name, ".svg"))
  svg_text <- readLines(f, warn = FALSE)
  i <- grep("^<svg ", svg_text)[1]
  svg_text[i] <- sub('width="[^"]*" height="[^"]*" viewBox="[^"]*"',
    sprintf('width="%.1fpt" height="%.1fpt" viewBox="%.1f %.1f %.1f %.1f"', vb[3], vb[4], vb[1], vb[2], vb[3], vb[4]),
    svg_text[i])
  writeLines(svg_text, f)
}

# A real MuSemantiQ page can sit inside an R figure. The renderer writes the
# score and its semantic bounds; this inserts the score before crop_fig runs.
include_rendered_svg <- function(name, x, y, scale = 1) {
  example <- file.path(out, "omr-examples", paste0(name, ".svg"))
  lines <- readLines(example, warn = FALSE)
  first <- grep("^<svg ", lines)[1]
  view_height <- as.numeric(sub('.*viewBox="[^"]*? ([0-9.]+)".*', '\\1', lines[first]))
  text <- paste(lines, collapse = "\n")
  opening_end <- regexpr(">", text)[1]
  closing_start <- regexpr("</svg>", text)[1]
  body <- substr(text, opening_end + 1, closing_start - 1)
  inserted <- c(sprintf('<g transform="translate(%.4f,%.4f) scale(%.6f)">', x * 0.72, y * 0.72, scale * 0.72), body, "</g>")
  figure <- readLines(fig_file, warn = FALSE)
  insert_at <- grep('^<rect x=.*fill="rgb', figure)[1]
  if (is.na(insert_at)) insert_at <- length(figure) - 1
  figure <- append(figure, inserted, after = insert_at)
  writeLines(figure, fig_file)
  mark_box(x, y, x + 980 * scale, y + view_height * scale)
}

# ── 0 · scale is part of the model ──
fig_00_scale_distance <- function() {
  open_fig("fig-00-scale-distance", 900, 285)
  ys <- seq(60, 108, 12)
  for (y in ys) draw_seg(80, y, 390, y, col = muted, lwd = 1.3)
  draw_seg(58, 60, 58, 84, col = accent, lwd = 2)
  draw_seg(62, 60, 68, 60, col = accent, lwd = 2)
  draw_seg(62, 84, 68, 84, col = accent, lwd = 2)
  note(24, 140, "u = 24 px", adj = c(0, 0.5))
  dashed(406, 60, 406, 72, col = accent)
  note(418, 68, "s = 12 px")
  math(570, 100, expression(hat(u) == u / s), size = 22, adj = c(0.5, 0.5))
  note(570, 136, "= 24 / 12 = 2 staff spaces")
  math(420, 206, expression("pixels can change; " * hat(u) * " stays musical"), size = 17, adj = c(0.5, 0.5))
  dev.off()
  add(0.1, "fig-00-scale-distance")
}

fig_00_scale_thickness <- function() {
  open_fig("fig-00-scale-thickness", 900, 285)
  for (y in c(70, 94, 118, 142, 166)) draw_seg(80, y, 380, y, col = rule, lwd = 1.2)
  cell(80, 104, 300, 6, fill = ink, border = ink)
  draw_seg(400, 104, 400, 110, col = accent, lwd = 2)
  note(414, 108, "t = 6 px")
  note(88, 218, "the staff space remains s = 24 px")
  math(580, 108, expression(hat(t) == t / s), size = 21, adj = c(0.5, 0.5))
  note(580, 144, "= 6 / 24 = 0.25 staff spaces")
  dev.off()
  add(0.2, "fig-00-scale-thickness")
}

fig_00_scale_thresholds <- function() {
  open_fig("fig-00-scale-thresholds", 900, 310)
  for (y in seq(55, 103, 12)) draw_seg(60, y, 330, y, col = muted, lwd = 1.2)
  draw_seg(52, 55, 52, 79, col = accent, lwd = 2)
  note(40, 68, "2s", adj = c(1, 0.5))
  cell(440, 55, 260, 5, fill = ink, border = ink)
  draw_seg(420, 55, 420, 60, col = accent, lwd = 2)
  note(408, 58, "2t", adj = c(1, 0.5))
  math(205, 176, expression(x[musical] == k[s] * s), size = 20, adj = c(0.5, 0.5))
  math(610, 176, expression(x[stroke] == k[t] * t), size = 20, adj = c(0.5, 0.5))
  note(205, 214, "musical distance: use the staff space")
  note(610, 214, "stroke operation: use line thickness")
  note(450, 274, "k_s and k_t are dimensionless; s and t are measured on this page", adj = c(0.5, 0.5))
  dev.off()
  add(0.3, "fig-00-scale-thresholds")
}

fig_00_scale_area <- function() {
  open_fig("fig-00-scale-area", 900, 330)
  cell(180, 60, 100, 100, fill = soft, border = muted)
  cell(180, 160, 100, 100, fill = soft, border = muted)
  cell(280, 60, 100, 100, fill = soft, border = muted)
  cell(280, 160, 100, 100, fill = ink, border = ink)
  cell(180, 60, 200, 200, fill = NA, border = accent, lwd = 2)
  note(170, 42, "footprint R: 2 × 2 source pixels")
  note(170, 284, "only one quarter is inside the bitmap")
  dashed(420, 160, 520, 160, col = accent)
  math(584, 146, expression(D == 1 / 4), size = 25, adj = c(0.5, 0.5))
  note(584, 182, "outside paper contributes zero ink,")
  note(584, 202, "but remains in |R| = 4")
  dev.off()
  add(0.4, "fig-00-scale-area")
}

fig_00_scale_sequence <- function() {
  open_fig("fig-00-scale-sequence", 1000, 330)
  qs <- c(0.5, 1, 2, 3)
  centers <- c(100, 270, 450, 640)
  for (k in seq_along(qs)) {
    q <- qs[k]; cx <- centers[k]
    for (j in 0:4) draw_seg(cx - 35 * q, 70 + j * 8 * q, cx + 35 * q, 70 + j * 8 * q, col = muted, lwd = 1.1)
    dot(cx, 86, col = ink, cex = 0.65 * q)
    draw_seg(cx + 5 * q, 86, cx + 5 * q, 42, col = ink, lwd = 1.5)
    note(cx, 200, paste0("q = ", q), adj = c(0.5, 0.5))
    flow(cx + 35 * q + 10, 180, 772, 180)
  }
  cell(790, 52, 144, 96, fill = soft, border = accent)
  for (i in 0:6) dashed(790 + i * 24, 52, 790 + i * 24, 148)
  for (j in 0:4) dashed(790, 52 + j * 24, 934, 52 + j * 24)
  note(862, 170, "the same normalized crop", adj = c(0.5, 0.5))
  pieces(500, 230, list(expression(B^{(q)} == q * B %->% D^{(q)}), "≈", expression(D)), size = 21, adj = c(0.5, 0.5))
  note(500, 266, "the source box scales; the model grid does not", adj = c(0.5, 0.5))
  dev.off()
  add(0.5, "fig-00-scale-sequence")
}

fig_omr_overview <- function() {
  open_fig("fig-omr-overview", 1000, 440)
  labels <- c("image", "analysis", "symbols", "music graph", "page schema", "MSQ")
  for (i in seq_along(labels)) {
    x <- 45 + (i - 1) * 155
    cell(x, 50, 122, 52, fill = if (i == 3) accent_soft else soft, border = if (i == 3) accent else rule)
    value_in(x, 50, 122, 52, labels[i], size = 16)
    if (i > 1) flow(x - 33, 76, x - 8, 76)
  }
  note(45, 196, "an actual MuSemantiQ-rendered page")
  note(640, 224, "inspectable output:")
  mono(640, 250, "measure")
  mono(640, 274, "stave")
  mono(640, 298, "treble clef")
  mono(640, 322, "1/4 c5 a4 with flat key")
  mono(640, 346, "1/8 b4 a4")
  note(640, 388, "unknown and ignored ink stays in the report")
  dev.off()
  include_rendered_svg("simple-score", 45, 220, 0.52)
  add(1, "fig-omr-overview")
}

fig_omr_measure <- function() {
  open_fig("fig-omr-measure", 1000, 465)
  steps <- c("staff geometry", "line removal", "components", "music rules", "schema")
  for (i in seq_along(steps)) {
    x <- 45 + (i - 1) * 190
    cell(x, 42, 150, 50, fill = soft, border = rule)
    value_in(x, 42, 150, 50, steps[i], size = 15)
    if (i > 1) flow(x - 40, 67, x - 8, 67)
  }
  metadata <- read.delim(file.path(out, "omr-examples", "simple-score.tsv"), header = FALSE)
  first_head <- metadata[which(metadata$V1 == "noteHead")[1], ]
  first_staff <- metadata[which(metadata$V1 == "stavePiece" & metadata$V3 - metadata$V2 > 100)[1], ]
  frame(40 + first_head$V2 * 0.65 - 4, 220 + first_head$V4 * 0.65 - 4,
        (first_head$V3 - first_head$V2) * 0.65 + 8, (first_head$V5 - first_head$V4) * 0.65 + 8)
  frame(40 + first_staff$V2 * 0.65 - 4, 220 + first_staff$V4 * 0.65 - 4,
        (first_staff$V3 - first_staff$V2) * 0.65 + 8, (first_staff$V5 - first_staff$V4) * 0.65 + 8)
  note(40, 196, "the highlights come from the renderer's own bounds")
  dev.off()
  include_rendered_svg("simple-score", 40, 220, 0.65)
  add(2, "fig-omr-measure")
}

fig_omr_cross_stave <- function() {
  open_fig("fig-omr-cross-stave", 1000, 520)
  note(35, 160, "one system: two staves, shared geometry")
  note(35, 455, "connections, cross-stave notes and spans belong to the graph, not to independent pages")
  dev.off()
  include_rendered_svg("cross-stave-score", 35, 190, 0.67)
  add(2.5, "fig-omr-cross-stave")
}

fig_omr_network <- function() {
  open_fig("fig-omr-network", 1000, 310)
  layers <- c("48×48", "conv 3×3", "ReLU + pool", "conv 3×3", "ReLU + pool", "dense", "softmax")
  for (i in seq_along(layers)) {
    x <- 30 + (i - 1) * 140
    cell(x, 80, 110, 58, fill = if (i == 7) accent_soft else soft, border = if (i == 7) accent else rule)
    value_in(x, 80, 110, 58, layers[i], size = 15)
    if (i > 1) flow(x - 30, 109, x - 5, 109)
  }
  note(45, 196, "forward for training and inference; backward only while training")
  note(45, 230, "the cache stores patches, activations and pool argmax positions")
  dev.off()
  add(3, "fig-omr-network")
}

fig_omr_training_loop <- function() {
  open_fig("fig-omr-training-loop", 1000, 320)
  steps <- c("sample", "forward", "cross-entropy", "backward", "AdamW")
  for (i in seq_along(steps)) {
    x <- 55 + (i - 1) * 185
    cell(x, 78, 145, 56, fill = soft, border = rule)
    value_in(x, 78, 145, 56, steps[i], size = 16)
    if (i > 1) flow(x - 40, 106, x - 8, 106)
  }
  flow(882, 152, 882, 230)
  flow(882, 230, 128, 230)
  flow(128, 230, 128, 152)
  note(500, 196, "repeat per batch; validate per epoch", adj = c(0.5, 0.5))
  note(500, 266, "keep the lowest validation loss and stop when it stops improving", adj = c(0.5, 0.5))
  dev.off()
  add(4, "fig-omr-training-loop")
}

fig_omr_data_factory <- function() {
  open_fig("fig-omr-data-factory", 1000, 320)
  steps <- c("isolated MSQ", "page schema", "SVG", "PNG at 6 scales", "labelled crops")
  for (i in seq_along(steps)) {
    x <- 45 + (i - 1) * 190
    cell(x, 70, 150, 54, fill = soft, border = rule)
    value_in(x, 70, 150, 54, steps[i], size = 15)
    if (i > 1) flow(x - 40, 97, x - 8, 97)
  }
  note(500, 218, "the renderer supplies the class and the box")
  note(500, 244, "fresh degradation is applied after the clean cache")
  dev.off()
  include_rendered_svg("simple-score", 45, 205, 0.38)
  add(5, "fig-omr-data-factory")
}

fig_omr_evaluation <- function() {
  open_fig("fig-omr-evaluation", 1000, 360)
  cell(45, 55, 270, 210, fill = soft, border = rule)
  note(70, 42, "confusion matrix")
  values <- matrix(c(18, 1, 0, 1, 0, 2, 15, 1, 0, 0, 1, 17, 0, 0, 0, 1), 4, 4, byrow = TRUE)
  for (r in 1:4) for (c in 1:4) {
    cell(70 + (c - 1) * 48, 70 + (r - 1) * 42, 48, 42, fill = if (r == c) ok_soft else accent_soft, border = "white")
    value_in(70 + (c - 1) * 48, 70 + (r - 1) * 42, 48, 42, as.character(values[r, c]), size = 14)
  }
  cell(385, 55, 270, 210, fill = soft, border = rule)
  note(410, 42, "scale matrix")
  for (i in 1:4) {
    note(410, 76 + (i - 1) * 42, paste0("scale ", c(0.5, 1, 2, 3)[i]))
    cell(500, 62 + (i - 1) * 42, 110, 24, fill = ok_soft, border = "white")
    value_in(500, 62 + (i - 1) * 42, 110, 24, "staff + measures", size = 12)
  }
  cell(725, 55, 230, 210, fill = soft, border = rule)
  note(750, 42, "real page")
  note(750, 82, "uncertain")
  note(750, 112, "ignored")
  note(750, 142, "candidates")
  note(750, 184, "no silent guesses")
  note(45, 306, "a high crop score is useful only when the complete page schema also holds")
  dev.off()
  add(6, "fig-omr-evaluation")
}

fig_01_the_crop <- function() {
  open_fig("fig-01-the-crop", 640, 252)
  x0 <- 120; y0 <- 60; n <- 8; cw <- 20
  fills <- matrix(soft, n, n)
  fills[1, 1] <- fills[1, 2] <- fills[2, 1] <- "white"
  fills[cbind(c(2, 3, 2, 4, 5, 6, 6, 4), c(1, 1, 2, 5, 6, 2, 3, 4))] <- ink
  grid_of(x0, y0, n, n, cw, cw, fills)
  for (i in 0:n) dashed(x0 + i * cw, y0, x0 + i * cw, y0 + n * cw)
  for (j in 0:n) dashed(x0, y0 + j * cw, x0 + n * cw, y0 + j * cw)
  hot(x0 + 2 * cw, y0 + 2 * cw, cw, cw)
  flow(x0 + 2 * cw + cw, y0 + 2 * cw + cw / 2, 330, 110)
  math(336, 106, expression(x[i * "," * j] == "the ink of this pixel"), size = 16)
  note(336, 124, "one number: 0 (paper) to 1 (ink)")
  axis_line(x0, 42, x0 + n * cw + 10, 42); math(x0 + 80, 30, expression(i), adj = c(0.5, 0.5))
  note(x0 + n * cw + 18, 42, "columns")
  axis_line(104, y0, 104, y0 + n * cw + 8); math(92, 140, expression(j), adj = c(0.5, 0.5))
  note(82, 140, "rows", adj = c(1, 0.5))
  math(196, 238, expression(H == W * " = 48"), adj = c(0.5, 0.5))
  dev.off()
  add(1, "fig-01-the-crop")
}

# ── 2 · the sliding window, three frames ──
fig_02_the_convolution_window <- function() {
  positions <- list(c(3, 3), c(5, 3), c(5, 5))
  for (k in seq_along(positions)) {
    p <- positions[[k]]
    name <- paste0("fig-02-the-convolution-window-", k)
    open_fig(name, 900, 320)
    x0 <- 30; y0 <- 46; cw <- 18; n <- 9
    grid_of(x0, y0, n, n, cw, cw)
    frame(x0 + (p[1] - 3) * cw, y0 + (p[2] - 3) * cw, 3 * cw, 3 * cw)
    math(x0 + (p[1] - 3) * cw + 27, y0 + (p[2] - 3) * cw + 27, expression(F %*% F),
         size = 15, adj = c(0.5, 0.5))
    note(x0, 232, "window at (i, j) · offsets p, q")
    mono(60, 30, "input a — 9×9, C channels", size = 16)
    math(261, 108, expression(w[p * "," * q * "," * c * "," * k]), size = 15, adj = c(0.5, 0.5))
    arrow(208, 128, 314, 128)
    matrix_grid(330, 88, 3, 3, 26, 26)
    mono(330, 30, "filter w — 3×3×C, one per k", size = 16)
    note(330, 182, "weights, learned")
    mono(472, 108, "+ b", size = 15, adj = c(0.5, 0.5))
    arrow(424, 128, 520, 128)
    matrix_grid(560, 62, 4, 5, 32, 26)
    mono(560, 30, "output z — one cell per (i, j, k)", size = 16)
    math(700, 112, expression(z[i * "," * j * "," * k]), size = 15)
    note(700, 140, "written by that window")
    dev.off()
    add(2, name)
  }
}

# ── 3 · the ReLU over a map ──
fig_03_the_relu_over_a_map <- function() {
  open_fig("fig-03-the-relu-over-a-map", 640, 225)
  z <- matrix(c(-2, 3, -1, 4, -5, 2, 1, -3, 6, 0, 2, -4), 3, 4, byrow = TRUE)
  a <- matrix(pmax(0, z), nrow(z), ncol(z))
  for (r in 1:3) for (c in 1:4) {
    cell(100 + (c - 1) * 36, 60 + (r - 1) * 28, 36, 28)
    value_in(100 + (c - 1) * 36, 60 + (r - 1) * 28, 36, 28, as.character(z[r, c]))
    cell(380 + (c - 1) * 36, 60 + (r - 1) * 28, 36, 28)
    value_in(380 + (c - 1) * 36, 60 + (r - 1) * 28, 36, 28, as.character(a[r, c]))
  }
  flow(262, 102, 362, 102)
  mono(312, 88, "ReLU", adj = c(0.5, 0.5))
  mono(172, 172, "z — pre-activations", adj = c(0.5, 0.5))
  mono(452, 172, "a = max(0, z)", adj = c(0.5, 0.5))
  dev.off()
  add(3, "fig-03-the-relu-over-a-map")
}

# ── 4 · im2col ──
fig_04_im2col <- function() {
  open_fig("fig-04-im2col", 900, 250)
  matrix_grid(42, 44, 4, 10, 40, 17)
  hot(42, 134, 120, 17)
  mono(42, 30, "P — patches", size = 16)
  mono(42, 232, "row jH + i = window at (i, j)", size = 16)
  flow(168, 143, 208, 143)
  math(236, 30, expression(hat(W)^T * " — filters as columns"), size = 16)
  matrix_grid(236, 95, 3, 3, 40, 23)
  mono(236, 184, "R × K", size = 16)
  mono(386, 129, "+", size = 18, adj = c(0.5, 0.5))
  cell(412, 102, 12, 54)
  math(418, 174, expression(1 * b^T), size = 15, adj = c(0.5, 0.5))
  mono(458, 129, "=", size = 18, adj = c(0.5, 0.5))
  mono(500, 30, "Z — pre-activations", size = 16)
  matrix_grid(500, 44, 3, 10, 32, 17)
  hot(500, 134, 32, 17)
  mono(500, 232, "(HW) × K", size = 16)
  mono(640, 112, "one multiply replaces every", size = 16)
  mono(640, 132, "window sum of (2) — and the", size = 16)
  mono(640, 152, "derivatives come free", size = 16)
  dev.off()
  add(4, "fig-04-im2col")
}

# ── 5 · ReLU and max-pool ──
fig_05_relu_and_pool <- function() {
  open_fig("fig-05-relu-and-pool", 900, 300)
  axis_line(60, 170, 440, 170); axis_line(280, 170, 280, 40)
  draw_line(c(120, 280), c(170, 170), col = ink, lwd = 2)
  draw_line(c(280, 430), c(170, 95), col = ink, lwd = 2)
  dot(280, 170, col = accent, cex = 0.8)
  note(150, 156, "slope 0"); note(372, 78, "slope 1")
  math(266, 56, expression(a)); math(426, 190, expression(z))
  mono(470, 50, "2×2 window of a, one channel c")
  cells <- matrix(c(7, 3, 1, 2), 2, 2, byrow = TRUE)
  for (r in 1:2) for (c in 1:2) cell(470 + (c - 1) * 56, 80 + (r - 1) * 56, 56, 56)
  hot(470, 80, 56, 56)
  for (r in 1:2) for (c in 1:2) {
    value_in(470 + (c - 1) * 56, 80 + (r - 1) * 56, 56, 56, as.character(cells[r, c]),
             font = if (r == 1 && c == 1) 2 else 1)
  }
  arrow(596, 136, 656, 136)
  cell(672, 108, 56, 56); value_in(672, 108, 56, 56, "7", font = 2)
  math(700, 186, expression(a[i * "," * j * "," * c]^pool), size = 16, adj = c(0.5, 0.5))
  note(470, 220, "the max wins and is remembered (argmax)")
  note(470, 238, "for the backward pass")
  dev.off()
  add(5, "fig-05-relu-and-pool")
}

# ── 6 · the two slopes ──
fig_06_the_two_slopes <- function() {
  open_fig("fig-06-the-two-slopes", 640, 225)
  axis_line(80, 170, 560, 170); axis_line(320, 170, 320, 40)
  draw_line(c(120, 320), c(170, 170), col = ink, lwd = 2)
  draw_line(c(320, 520), c(170, 70), col = ink, lwd = 2)
  dot(320, 170, col = accent, cex = 0.8)
  note(160, 158, "slope 0"); note(368, 100, "slope 1")
  note(330, 196, "at z = 0 the slope is ε (7)")
  math(546, 190, expression(z)); math(306, 56, expression(a))
  note(70, 216, "flat left of zero, straight right of it")
  dev.off()
  add(6, "fig-06-the-two-slopes")
}

# ── 7 · dense and softmax ──
fig_07_dense_and_softmax <- function() {
  open_fig("fig-07-dense-and-softmax", 900, 300)
  for (y in c(62, 110, 158)) { rect(80 - 16, y - 16, 80 + 16, y + 16, col = "white", border = muted) }
  for (y in c(86, 134)) { rect(350 - 16, y - 16, 350 + 16, y + 16, col = accent_soft, border = accent) }
  for (y0 in c(62, 110, 158)) for (y1 in c(86, 134)) dashed(96, y0, 334, y1)
  math(50, 26, expression(a^{(l - 1)}), size = 16); math(342, 26, expression(z^{(l)}), size = 16)
  mono(188, 52, expression(W^{(l)}), size = 16, adj = c(0.5, 0.5))
  math(392, 86, expression("+" ~ b^{(l)}), size = 16)
  note(84, 190, "every input into every output")
  # scores → probabilities
  note(520, 40, "scores z become probabilities p")
  zb <- c(46, 64, 30, 76)
  for (i in 1:4) cell(520 + (i - 1) * 34, 190 - zb[i], 26, zb[i])
  math(520, 212, expression(z[1 * ":" * K]), size = 15)
  flow(670, 156, 708, 156)
  mono(689, 140, "softmax", adj = c(0.5, 0.5))
  pb <- c(36, 52, 20, 60)
  for (i in 1:4) hot(720 + (i - 1) * 34, 190 - pb[i], 26, pb[i])
  math(720, 212, expression(p[1 * ":" * K]), size = 15)
  note(762, 212, "sums to 1")
  note(520, 242, "one score per class c; after softmax,")
  note(520, 260, "bar height = probability")
  dev.off()
  add(7, "fig-07-dense-and-softmax")
}

# ── 8 · the cost curve ──
fig_08_the_cost_curve <- function() {
  open_fig("fig-08-the-cost-curve", 640, 230)
  axis_line(60, 190, 580, 190); axis_line(60, 190, 60, 26)
  px <- function(p) 60 + (p - 0) / 1 * 500
  py <- function(p) 190 - (-log(pmax(p, 1e-3))) / 5 * 160
  ps <- seq(0.01, 1, length.out = 200)
  draw_line(px(ps), py(ps), col = ink, lwd = 2)
  for (p in c(0.01, 0.5, 1)) {
    dot(px(p), py(p), col = accent, cex = 1.2, ring = TRUE)
  }
  note(px(0.01) + 14, py(0.01), expression(p == 0.01 %->% "cost 4.6"))
  note(px(0.5) - 4, py(0.5) - 20, expression(p == 0.5 %->% "cost 0.69"))
  note(px(1), py(1) - 22, expression(p == 1 %->% "cost 0"), adj = c(0.5, 0.5))
  note(380, 70, expression(C == -log ~ p[y] * ": confident and wrong"))
  note(380, 90, "is punished hard")
  math(580, 210, expression(p[y]), size = 16, adj = c(0.5, 0.5))
  note(px(0), 210, "0", adj = c(0.5, 0.5)); note(px(1), 210, "1", adj = c(0.5, 0.5))
  math(42, 30, expression(C), adj = c(0.5, 0.5))
  dev.off()
  add(8, "fig-08-the-cost-curve")
}

# ── 9 · the two-part cost ──
fig_09_the_two_part_cost <- function() {
  open_fig("fig-09-the-two-part-cost", 640, 215)
  note(60, 46, "the cost of (12) is two parts")
  cell(60, 70, 330, 52); hot(390, 70, 90, 52)
  mono(225, 148, "cross-entropy: the fit of p to the truth", adj = c(0.5, 0.5))
  math(435, 148, expression(lambda * Sigma * theta^2), size = 16, adj = c(0.5, 0.5))
  note(60, 186, "the penalty is small but never zero: it keeps the weights from drifting")
  dev.off()
  add(9, "fig-09-the-two-part-cost")
}

# ── 10 · the initial bell ──
fig_10_the_initial_bell <- function() {
  open_fig("fig-10-the-initial-bell", 640, 245)
  axis_line(60, 180, 580, 180); axis_line(320, 180, 320, 30)
  x <- seq(-3, 3, length.out = 300)
  draw_line(320 + x * 73, 180 - dnorm(x) / dnorm(0) * 120, col = ink, lwd = 2)
  dashed(320 - 73, 180, 320 - 73, 132); dashed(320 + 73, 180, 320 + 73, 132)
  math(238, 200, expression(-sigma), size = 16, adj = c(0.5, 0.5)); mono(320, 200, "0", adj = c(0.5, 0.5))
  math(394, 200, expression(sigma), size = 16, adj = c(0.5, 0.5))
  math(320, 230, expression(sigma == sqrt(2 / "fan-in")), size = 16, adj = c(0.5, 0.5))
  note(30, 30, "weights start small and centred;")
  note(30, 48, "biases start at 0")
  dev.off()
  add(10, "fig-10-the-initial-bell")
}

# ── 11 · gradient descent, four frames ──
fig_11_gradient_descent <- function() {
  c_of <- function(t) 40 + 170 * exp(-((t - 0.52)^2) / 0.16)
  tmin <- 0.52
  xs <- function(t) 60 + t * 600
  ys <- function(t) c_of(t)
  steps <- c(0.04, 0.18, 0.34, tmin)
  for (k in seq_along(steps)) {
    name <- paste0("fig-11-gradient-descent-", k)
    open_fig(name, 720, 300)
    t <- seq(0, 1, length.out = 300)
    draw_line(xs(t), ys(t), col = ink, lwd = 2)
    # the θ axis, with every position visited so far ticked on it
    axis_line(60, 256, 680, 256); math(672, 274, expression(theta), size = 16, adj = c(0.5, 0.5))
    for (i in seq_len(k)) {
      draw_seg(xs(steps[i]), 250, xs(steps[i]), 262, col = if (i == k) accent else muted, lwd = 1.6)
      if (i < k) dot(xs(steps[i]), ys(steps[i]), col = muted, cex = 0.7)
    }
    if (k > 1) {
      flow(xs(steps[k - 1]), 240, xs(steps[k]) - 4, 240)
      math((xs(steps[k - 1]) + xs(steps[k])) / 2, 226, expression(-eta * g), size = 15, adj = c(0.5, 0.5))
    }
    dot(xs(tmin), ys(tmin), col = ok, cex = 0.8)
    note(xs(tmin) + 14, ys(tmin) + 14, "minimum of C", adj = c(0, 0.5))
    dot(xs(steps[k]), ys(steps[k]), col = accent, cex = 1.3, ring = TRUE)
    note(60, 290, "each step moves θ against the slope g, by η times it")
    mono(60, 24, expression(C(theta) ~ "— the cost as one number" ~ theta ~ "moves"), size = 15)
    dev.off()
    add(11, name)
  }
}

# ── 12 · the backward pass, five frames ──
fig_12_the_backward_pass <- function() {
  labels <- list(expression(a^{(l - 1)}), expression(W^{(l)}), expression(z^{(l)}), "ReLU", "softmax", "cost C")
  bx <- 20 + (0:5) * 124; bw <- 100
  for (k in 1:5) {
    name <- paste0("fig-12-the-backward-pass-", k)
    open_fig(name, 960, 200)
    for (i in 1:6) {
      lit <- (i == 6 - k + 1)
      cell(bx[i], 60, bw, 42, fill = if (lit) ok_soft else if (i == 6) accent_soft else "white",
           border = if (lit) ok else muted, lwd = if (lit) 2 else 1)
      mono(bx[i] + bw / 2, 81, labels[[i]], size = 18, adj = c(0.5, 0.5))
    }
    mid <- (bx[1] + bx[6] + bw) / 2
    axis_line(bx[1] + bw / 2, 46, bx[6] + bw / 2, 46)
    mono(mid, 30, "forward: the answer", size = 16, adj = c(0.5, 0.5))
    flow(bx[6] + bw / 2, 118, bx[1] + bw / 2, 118)
    mono(mid, 138, "backward: blame, one factor per stage", size = 16, adj = c(0.5, 0.5))
    dot(bx[7 - k] + bw / 2, 118, col = ok, cex = 1.3, ring = TRUE)
    mono(mid, 166, "the error signal arrives at each stage, which multiplies it by its own input",
         size = 15, adj = c(0.5, 0.5))
    dev.off()
    add(12, name)
  }
}

# ── 13 · the stable rewrite ──
fig_13_the_stable_rewrite <- function() {
  open_fig("fig-13-the-stable-rewrite", 640, 245)
  z <- c(46, 70, 34, 58, 40)
  for (i in 1:5) cell(70 + (i - 1) * 40, 190 - z[i], 30, z[i])
  frame(110, 120, 30, 70)
  dashed(55, 120, 280, 120)
  note(288, 124, "m = max z")
  note(330, 150, expression(log ~ Sigma ~ e^z ~ "— all scores push up"))
  note(330, 172, expression(-z[y] ~ "— the true score pulls down"))
  note(70, 222, "the same m appears in (10) and cancels under the log")
  note(70, 40, "the shift m cancels — the cost of (16) is stable to compute")
  dev.off()
  add(13, "fig-13-the-stable-rewrite")
}

# ── 14 · the log-sum-exp tangent ──
fig_14_the_log_sum_exp_tangent <- function() {
  open_fig("fig-14-the-log-sum-exp-tangent", 640, 245)
  axis_line(60, 180, 580, 180); axis_line(100, 180, 100, 30)
  f <- function(z) log(exp(z) + exp(1.2))
  z <- seq(-2.2, 2.6, length.out = 300)
  draw_line(100 + (z + 2.2) * 100, 180 - (f(z) - f(-2.2)) / (f(2.6) - f(-2.2)) * 130, col = ink, lwd = 2)
  z0 <- 0.6
  px <- 100 + (z0 + 2.2) * 100; py <- 180 - (f(z0) - f(-2.2)) / (f(2.6) - f(-2.2)) * 130
  slope <- exp(z0) / (exp(z0) + exp(1.2))
  sv <- slope * (130 / (f(2.6) - f(-2.2))) / 100
  draw_seg(px - 80, py + 80 * sv, px + 80, py - 80 * sv, col = muted, lwd = 1.4, lty = 2)
  dot(px, py, col = accent, cex = 0.9)
  note(px + 92, py - 80 * sv + 14, expression("tangent slope" == p[c]))
  math(580, 200, expression(z[c]), size = 16, adj = c(0.5, 0.5))
  math(112, 46, expression(log ~ Sigma ~ e^z), size = 15)
  note(100, 234, "differentiating the normalizer returns the softmax itself (17)")
  dev.off()
  add(14, "fig-14-the-log-sum-exp-tangent")
}

# ── 15 · the last layer's blame ──
fig_15_the_last_layer_blame <- function() {
  open_fig("fig-15-the-last-layer-blame", 900, 320)
  mono(135, 76, "p — probabilities (10)", adj = c(0.5, 0.5))
  mono(365, 76, "onehot(y) — the truth", adj = c(0.5, 0.5))
  math(595, 70, expression(delta^(L) == p - onehot(y)), size = 16, adj = c(0.5, 0.5))
  mono(595, 94, "the blame (18)", adj = c(0.5, 0.5))
  mono(250, 200, "\u2212", size = 20, adj = c(0.5, 0.5)); mono(480, 200, "=", size = 20, adj = c(0.5, 0.5))
  # bar height 80 is probability 1, so the five p bars add up to the one-hot bar
  p <- c(14, 24, 10, 19, 13); one <- 80
  for (i in 1:5) cell(60 + (i - 1) * 30, 200 - p[i], 24, p[i])
  for (i in 1:5) if (i == 3) hot(350, 200 - one, 24, one) else cell(290 + (i - 1) * 30, 198, 24, 2)
  for (i in 1:5) {
    if (i == 3) hot(580, 200, 24, one - p[i]) else cell(520 + (i - 1) * 30, 200 - p[i], 24, p[i])
  }
  dashed(55, 200, 215, 200); dashed(285, 200, 445, 200); dashed(515, 200, 675, 200)
  note(520, 296, "one entry is negative: the truth was uncertain")
  dev.off()
  add(15, "fig-15-the-last-layer-blame")
}

# ── 16 · the weight gradient table ──
fig_16_the_weight_gradient_table <- function() {
  open_fig("fig-16-the-weight-gradient-table", 640, 235)
  note(70, 16, "one row and one column meet in one number (19)")
  for (r in 1:5) cell(110, 70 + (r - 1) * 24, 36, 24)
  hot(110, 118, 36, 24)
  for (c in 1:5) cell(160 + (c - 1) * 36, 30, 36, 32)
  hot(232, 30, 36, 32)
  for (r in 1:5) for (c in 1:5) cell(160 + (c - 1) * 36, 70 + (r - 1) * 24, 36, 24)
  hot(232, 118, 36, 24)
  math(128, 46, expression(delta)); math(358, 50, expression(a))
  pieces(380, 110, list(expression(dW[j * "," * k] == delta[j]), "\u22c5", expression(a[k])))
  note(380, 130, "row factor times column factor")
  dev.off()
  add(16, "fig-16-the-weight-gradient-table")
}

# ── 17 · the outer product ──
fig_17_the_outer_product <- function() {
  open_fig("fig-17-the-outer-product", 800, 225)
  for (r in 1:5) cell(70, 50 + (r - 1) * 24, 36, 24)
  for (c in 1:5) cell(170 + (c - 1) * 24, 88, 24, 32)
  for (r in 1:5) for (c in 1:5) cell(350 + (c - 1) * 32, 50 + (r - 1) * 24, 32, 24)
  math(88, 32, expression(delta), adj = c(0.5, 0.5))
  math(230, 72, expression(a^T), adj = c(0.5, 0.5))
  math(430, 32, expression(dW), adj = c(0.5, 0.5))
  mono(136, 114, "\u00d7", size = 18, adj = c(0.5, 0.5))
  math(320, 114, expression("="), adj = c(0.5, 0.5))
  note(88, 192, "(K × 1)", adj = c(0.5, 0.5))
  note(230, 192, "(1 × N)", adj = c(0.5, 0.5))
  note(430, 192, "(K × N)", adj = c(0.5, 0.5))
  mono(560, 100, expression(dW == delta ~ a^T), size = 16)
  mono(560, 122, expression(db == delta), size = 16)
  mono(560, 144, expression(da == W^T ~ delta), size = 16)
  dev.off()
  add(17, "fig-17-the-outer-product")
}

# ── 18 · the ReLU gate ──
fig_18_the_relu_gate <- function() {
  open_fig("fig-18-the-relu-gate", 640, 255)
  note(60, 36, "ReLU (21): blame passes only where z > 0")
  da <- c(3, 5, 0, 2, 7, 4); gate <- c(1, 1, 0, 1, 1, 0); dz <- da * gate
  for (i in 1:6) {
    cell(60 + (i - 1) * 44, 70, 44, 30); value_in(60 + (i - 1) * 44, 70, 44, 30, da[i])
    cell(60 + (i - 1) * 44, 120, 44, 30); value_in(60 + (i - 1) * 44, 120, 44, 30, gate[i])
    cell(60 + (i - 1) * 44, 170, 44, 30)
  }
  for (i in 1:6) {
    if (dz[i] == 0) hot(60 + (i - 1) * 44, 170, 44, 30)
    value_in(60 + (i - 1) * 44, 170, 44, 30, dz[i])
  }
  mono(340, 85, expression(delta * a ~ "— arriving"), size = 16)
  mono(340, 135, "1[z > 0] — the gate", size = 16)
  pieces(340, 185, list(expression(delta * z == delta * a), "\u2299", "gate"))
  dev.off()
  add(18, "fig-18-the-relu-gate")
}

# ── 19 · the argmax routing ──
fig_19_the_argmax_routing <- function() {
  open_fig("fig-19-the-argmax-routing", 640, 258)
  note(60, 36, "max-pool (22): blame goes only to the remembered argmax")
  vals <- matrix(c(7, 3, 1, 2), 2, 2, byrow = TRUE)
  for (r in 1:2) for (c in 1:2) cell(120 + (c - 1) * 60, 70 + (r - 1) * 60, 60, 60)
  hot(120, 70, 60, 60)
  for (r in 1:2) for (c in 1:2) {
    value_in(120 + (c - 1) * 60, 70 + (r - 1) * 60, 60, 60, vals[r, c], font = if (r == 1 && c == 1) 2 else 1)
  }
  flow(258, 130, 352, 130)
  mono(305, 116, "argmax", adj = c(0.5, 0.5))
  for (r in 1:2) for (c in 1:2) {
    cell(380 + (c - 1) * 60, 70 + (r - 1) * 60, 60, 60)
    if (r == 1 && c == 1) math(410, 100, expression(delta * a), size = 16, adj = c(0.5, 0.5)) else value_in(380 + (c - 1) * 60, 70 + (r - 1) * 60, 60, 60, "0")
  }
  note(180, 214, "values before pooling (8)", adj = c(0.5, 0.5))
  note(440, 214, "blame after (22)", adj = c(0.5, 0.5))
  note(310, 244, "the three losers get 0: they never touched the output", adj = c(0.5, 0.5))
  dev.off()
  add(19, "fig-19-the-argmax-routing")
}

# ── 20 · the factor chain ──
fig_20_the_factor_chain <- function() {
  open_fig("fig-20-the-factor-chain", 900, 215)
  note(395, 40, "every stage contributes one factor — read right to left (23)", adj = c(0.5, 0.5))
  boxes <- list(expression(delta^{(L)}), bquote("×" ~ W^{(L) * T}), "gate", bquote("×" ~ W^T), "gate", bquote("×" ~ a^{(l - 1) * T}))
  bx <- 20 + (5:0) * 130
  for (i in 1:6) {
    cell(bx[i], 70, 100, 40, fill = if (i == 1) accent_soft else "white", border = if (i == 1) accent else muted)
    mono(bx[i] + 50, 90, boxes[[i]], size = 17, adj = c(0.5, 0.5))
  }
  for (x in bx[1:5]) flow(x - 4, 90, x - 26, 90)
  note(20, 166, "two factors per layer: a gate, then a transpose")
  note(20, 188, expression("×" ~ a^T ~ "turns the blame into the weight gradient"))
  dev.off()
  add(20, "fig-20-the-factor-chain")
}

# ── 21 · the bias split ──
fig_21_the_bias_split <- function() {
  open_fig("fig-21-the-bias-split", 640, 235)
  note(80, 36, "blame leaves the sum node: scaled to W, unchanged to b")
  cell(80, 60, 110, 40, fill = "white", border = muted)
  cell(80, 150, 110, 40, fill = "white", border = muted)
  mono(135, 80, expression(W), size = 17, adj = c(0.5, 0.5))
  mono(135, 170, expression(b), size = 17, adj = c(0.5, 0.5))
  hot(420, 105, 110, 40)
  mono(475, 125, expression(delta), size = 17, adj = c(0.5, 0.5))
  flow(416, 116, 200, 84); flow(416, 136, 200, 168)
  math(330, 128, expression("×" ~ a %->% dW), size = 16, adj = c(0.5, 0.5))
  math(300, 176, expression("×" ~ 1 %->% db == delta), size = 16, adj = c(0.5, 0.5))
  note(80, 218, "a bias is a pure shift: its coefficient is 1, so the blame arrives untouched")
  dev.off()
  add(21, "fig-21-the-bias-split")
}

# ── 22 · the convolution's products ──
fig_22_the_convolution_products <- function() {
  open_fig("fig-22-the-convolution-products", 900, 215)
  note(60, 18, "the convolution's gradients are matrix products (25)")
  matrix_grid(60, 60, 2, 3, 36, 30)
  mono(98, 44, expression(D^T), adj = c(0.5, 0.5)); note(98, 172, "(K × HW)", adj = c(0.5, 0.5))
  mono(160, 100, "\u00d7", size = 18, adj = c(0.5, 0.5))
  matrix_grid(200, 60, 4, 3, 30, 30)
  mono(260, 44, expression(P), adj = c(0.5, 0.5)); note(260, 172, "(HW × R)", adj = c(0.5, 0.5))
  math(350, 100, expression("="), adj = c(0.5, 0.5))
  matrix_grid(390, 60, 3, 3, 36, 30)
  mono(446, 44, expression(d * hat(W)), adj = c(0.5, 0.5)); note(446, 172, "(K × R)", adj = c(0.5, 0.5))
  mono(560, 92, expression(db == 1^T ~ D), size = 16)
  note(700, 92, "— column sums")
  mono(560, 114, expression(dP == D ~ hat(W)), size = 16)
  note(700, 114, "— patch blame")
  note(560, 144, "patches overlap: col2im (26) adds them up")
  dev.off()
  add(22, "fig-22-the-convolution-products")
}

# ── 23 · col2im ──
fig_23_col2im <- function() {
  open_fig("fig-23-col2im", 700, 235)
  note(220, 22, "one cell, two windows: the blames add — (26)")
  grid_of(220, 40, 6, 6, 24, 24)
  cell(268, 88, 48, 48, fill = accent_soft, border = NA)
  for (o in list(c(244, 64), c(268, 88))) {
    mark_box(o[1], o[2], o[1] + 72, o[2] + 72)
    rect(o[1], o[2], o[1] + 72, o[2] + 72, col = NA, border = accent, lwd = 1.8, lty = 2)
  }
  frame(268, 88, 24, 24, lwd = 2.4)
  note(440, 100, "da(i, j, c) = the sum over")
  note(440, 120, "every patch that covers it")
  note(440, 148, "im2col cut overlaps;")
  note(440, 166, "col2im adds them back")
  note(220, 212, "the ringed cell collects from both dashed windows")
  dev.off()
  add(23, "fig-23-col2im")
}

# ── 24 · the pull to zero ──
fig_24_the_pull_to_zero <- function() {
  open_fig("fig-24-the-pull-to-zero", 640, 270)
  axis_line(80, 180, 560, 180); axis_line(320, 180, 320, 40)
  draw_line(c(180, 460), c(222, 138), col = ink, lwd = 2)
  flow(180, 160, 250, 160); flow(440, 200, 380, 200)
  math(470, 132, expression(2 * lambda * theta)); math(552, 198, expression(theta), adj = c(0.5, 0.5))
  mono(306, 198, "0", adj = c(0.5, 0.5))
  note(340, 60, "the penalty's pull grows with the weight")
  note(320, 252, "farther from zero, the harder it pulls home — (27)", adj = c(0.5, 0.5))
  dev.off()
  add(24, "fig-24-the-pull-to-zero")
}

# ── 25 · the Adam memories ──
fig_25_the_adam_memories <- function() {
  open_fig("fig-25-the-adam-memories", 900, 280)
  g <- c(52, -20, 44, -52, 30, 60, -40, 22, 50, -30)
  m <- v <- numeric(length(g)); am <- av <- 0
  for (i in seq_along(g)) {
    am <- 0.9 * am + 0.1 * g[i]; av <- 0.999 * av + 0.001 * g[i]^2
    m[i] <- am / (1 - 0.9^i); v[i] <- av / (1 - 0.999^i)
  }
  x <- 100 + (seq_along(g) - 1) * 60
  base <- 160
  dashed(80, base, 660, base)
  draw_seg(x, base, x, base - g, col = muted, lwd = 2)
  draw_line(x, base - sqrt(v), col = accent, lwd = 2, lty = 2)
  draw_line(x, base - m, col = ink, lwd = 2)
  # the legend: each label beside a sample of its own mark
  draw_seg(100, 30, 100, 46, col = muted, lwd = 2)
  note(112, 38, expression(g[t] ~ "— this step's noise"))
  draw_line(c(300, 324), c(38, 38), col = ink, lwd = 2)
  note(332, 38, expression(hat(m)[t] ~ "— smoothed direction"))
  draw_line(c(530, 554), c(38, 38), col = accent, lwd = 2, lty = 2)
  note(562, 38, expression(sqrt(hat(v)[t]) ~ "— smoothed scale"))
  note(100, 262, expression(beta[1] == 0.9 ~ "keeps the past;" ~ beta[2] == 0.999 ~ "keeps even more of it — (28)"))
  dev.off()
  add(25, "fig-25-the-adam-memories")
}

# ── 26 · the bias correction ──
fig_26_the_bias_correction <- function() {
  open_fig("fig-26-the-bias-correction", 800, 255)
  axis_line(80, 200, 660, 200); axis_line(100, 200, 100, 40)
  math(660, 218, expression(t), adj = c(0.5, 0.5))
  # a gradient that is the same every step: E[g] sits at height 100
  t <- 1:9
  raw <- 1 - 0.9^t
  x <- 120 + (t - 1) * 60
  dashed(100, 100, x[9] + 6, 100)
  note(120, 84, "the true direction E[g]")
  draw_line(x, 200 - raw * 100, col = ink, lwd = 2)
  for (i in t) { dot(x[i], 200 - raw[i] * 100, col = ink, cex = 0.7); dot(x[i], 100, col = accent, cex = 0.9) }
  note(x[9] + 16, 100, expression(hat(m) ~ "— corrected"))
  note(x[9] + 16, 200 - raw[9] * 100, expression(m ~ "— raw"))
  note(100, 236, "without the correction the first steps would barely move (29)")
  dev.off()
  add(26, "fig-26-the-bias-correction")
}

# ── 27 · the Adam step ──
fig_27_the_adam_step <- function() {
  open_fig("fig-27-the-adam-step", 700, 235)
  axis_line(80, 170, 620, 170)
  dot(420, 170, col = accent, cex = 0.9)
  dot(280, 170, col = ok, cex = 0.9)
  flow(415, 140, 290, 140)
  pieces(350, 112, list(expression("step =" ~ eta), "\u22c5", expression(hat(m) / (sqrt(hat(v)) + epsilon))),
         size = 16, adj = c(0.5, 0.5))
  math(420, 194, expression(theta[t - 1]), size = 16, adj = c(0.5, 0.5)); math(280, 194, expression(theta[t]), size = 16, adj = c(0.5, 0.5))
  note(80, 56, "the direction comes from the corrected m, the size from the corrected v (30)")
  note(80, 226, expression(eta ~ "scales the whole move;" ~ epsilon ~ "only guards the division"))
  dev.off()
  add(27, "fig-27-the-adam-step")
}

# ── 28 · the central difference ──
fig_28_the_central_difference <- function() {
  open_fig("fig-28-the-central-difference", 640, 315)
  f <- function(x) x^2 + 0.25 * x^3
  df <- function(x) 2 * x + 0.75 * x^2
  px <- function(x) 300 + x * 120
  py <- function(x) 230 - f(x) * 28
  x <- seq(-1.4, 1.9, length.out = 300)
  axis_line(120, 250, 580, 250)
  draw_line(px(x), py(x), col = ink, lwd = 2)
  x0 <- 0.6; e <- 0.9
  # tangent at θ, and the secant through θ − ε and θ + ε: nearly parallel
  tv <- df(x0) * 28 / 120
  draw_seg(px(x0) - 80, py(x0) + 80 * tv, px(x0) + 150, py(x0) - 150 * tv, col = muted, lwd = 1.6, lty = 2)
  sv <- (py(x0 + e) - py(x0 - e)) / (px(x0 + e) - px(x0 - e))
  draw_seg(px(x0 - e) - 40, py(x0 - e) - 40 * sv, px(x0 + e) + 60, py(x0 + e) + 60 * sv, col = accent, lwd = 1.6, lty = 2)
  note(px(x0) + 158, py(x0) - 150 * tv, "tangent at θ")
  note(px(x0 + e) + 68, py(x0 + e) + 60 * sv, "secant")
  for (s in c(x0 - e, x0, x0 + e)) draw_seg(px(s), py(s), px(s), 250, col = rule, lwd = 1.2, lty = 3)
  for (s in c(x0 - e, x0 + e)) dot(px(s), py(s), col = accent, cex = 0.9)
  dot(px(x0), py(x0), col = ink, cex = 0.9)
  math(px(x0 - e), 268, expression(theta - epsilon), size = 16, adj = c(0.5, 0.5))
  math(px(x0), 268, expression(theta), size = 16, adj = c(0.5, 0.5))
  math(px(x0 + e), 268, expression(theta + epsilon), size = 16, adj = c(0.5, 0.5))
  note(120, 296, expression("the slopes differ by" ~ O(epsilon^2) * ", by Taylor's expansion"))
  dev.off()
  add(28, "fig-28-the-central-difference")
}

# ── 29 · the check error ──
fig_29_the_check_error <- function() {
  open_fig("fig-29-the-check-error", 640, 255)
  axis_line(80, 192, 560, 192)
  hot(180, 84, 60, 108); hot(340, 165, 60, 27)
  mono(210, 70, "error at ε", adj = c(0.5, 0.5))
  mono(370, 151, "error at ε/2", adj = c(0.5, 0.5))
  math(210, 212, expression(epsilon^2), size = 15, adj = c(0.5, 0.5)); math(370, 212, expression(epsilon^2 / 4), size = 15, adj = c(0.5, 0.5))
  note(320, 30, expression("halve" ~ epsilon * ": the error drops fourfold (32)"), adj = c(0.5, 0.5))
  note(320, 244, "the check gets sharper fast — but too small an ε re-enters rounding", adj = c(0.5, 0.5))
  dev.off()
  add(29, "fig-29-the-check-error")
}

# ── 30–34 · local stave geometry ──
fig_30_local_stave_space <- function() {
  open_fig("fig-30-local-stave-space", 900, 330)
  draw_stave <- function(ys) for (y in ys) draw_seg(90, y, 500, y, col = muted, lwd = 1.3)
  draw_stave(c(50, 60, 84, 100, 120))
  draw_stave(c(190, 200, 210, 220, 230))
  note(90, 30, "stave a: measured gaps 10, 24, 16, 20")
  note(90, 172, "stave b: measured gaps 10, 10, 10, 10")
  math(555, 84, expression(s[a] == (120 - 50) / 4), size = 19)
  note(760, 84, "= 17.5 px", adj = c(0.5, 0.5))
  math(555, 208, expression(s[b] == (230 - 190) / 4), size = 19)
  note(760, 208, "= 10 px", adj = c(0.5, 0.5))
  note(90, 278, "the mean is local to the stave; all five measured line positions remain available")
  dev.off()
  add(30, "fig-30-local-stave-space")
}

fig_31_local_stave_thickness <- function() {
  open_fig("fig-31-local-stave-thickness", 900, 320)
  draw_seg(90, 116, 480, 116, col = rule, lwd = 1.2)
  runs <- list(c(160, 4), c(280, 6), c(400, 9))
  for (run in runs) {
    x <- run[1]; length <- run[2]
    cell(x - 18, 116 - length / 2, 36, length, fill = ink, border = ink)
    dashed(x, 70, x, 162, col = accent)
    note(x, 186, paste0("run = ", length, " px"), adj = c(0.5, 0.5))
  }
  note(90, 42, "vertical samples across one measured stave line")
  math(575, 108, expression(t[r] == umedian(4, 6, 9)), size = 18)
  note(780, 108, "= 6 px", adj = c(0.5, 0.5))
  note(575, 150, "ink > 0.25; include the centre pixel")
  cell(90, 242, 390, 3, fill = ink, border = ink)
  note(510, 244, "another stave can have t = 3 px")
  note(90, 292, "the upper median is measured per stave, never borrowed from the page")
  dev.off()
  add(31, "fig-31-local-stave-thickness")
}

fig_32_position_interpolation <- function() {
  open_fig("fig-32-position-interpolation", 900, 440)
  values <- c(60, 70, 84, 100, 120)
  ys <- 50 + (values - 60) * 5
  for (j in seq_along(values)) {
    draw_seg(120, ys[j], 520, ys[j], col = muted, lwd = 1.3)
    note(108, ys[j], paste0("y = ", values[j]), adj = c(1, 0.5))
    math(548, ys[j], bquote(q == .(2 * (j - 1))), size = 16)
  }
  point_y <- 50 + (77 - 60) * 5
  dashed(120, point_y, 520, point_y, col = accent)
  dot(430, point_y, col = accent, cex = 1.1)
  note(108, point_y, "y = 77", adj = c(1, 0.5))
  draw_seg(465, ys[2], 465, ys[3], col = accent, lwd = 2)
  note(478, (ys[2] + point_y) / 2, "7 px")
  note(478, (point_y + ys[3]) / 2, "7 px")
  note(610, point_y, "halfway through gap j = 1")
  math(610, point_y + 38, expression(q == 2 * (1 + 7 / 14) ~ "=" ~ 3), size = 19)
  note(120, 400, "the enclosing measured gap is 14 px, not the stave's 15 px mean")
  dev.off()
  add(32, "fig-32-position-interpolation")
}

fig_33_local_stave_interval <- function() {
  open_fig("fig-33-local-stave-interval", 900, 330)
  for (y in seq(45, 85, 10)) draw_seg(90, y, 410, y, col = muted, lwd = 1.3)
  for (y in seq(155, 211, 14)) draw_seg(90, y, 410, y, col = muted, lwd = 1.3)
  note(90, 26, "upper stave a: s = 10 px")
  note(90, 136, "lower stave b: s = 14 px")
  draw_seg(448, 85, 448, 155, col = accent, lwd = 2)
  draw_seg(440, 85, 456, 85, col = accent, lwd = 2)
  draw_seg(440, 155, 456, 155, col = accent, lwd = 2)
  note(466, 120, "G = 70 px")
  math(620, 82, expression(bar(s)[a * "," * b] == (10 + 14) / 2 ~ "=" ~ 12), size = 18)
  math(620, 132, expression(I[a * "," * b] == 70 / 12), size = 21)
  note(620, 170, "= 5.833 staff spaces", adj = c(0.5, 0.5))
  note(90, 270, "bottom of a to top of b; only a and b set the denominator")
  dev.off()
  add(33, "fig-33-local-stave-interval")
}

fig_34_local_page_line_interval <- function() {
  open_fig("fig-34-local-page-line-interval", 900, 465)
  for (y in seq(50, 90, 10)) draw_seg(90, y, 410, y, col = muted, lwd = 1.2)
  for (y in seq(125, 181, 14)) draw_seg(90, y, 410, y, col = muted, lwd = 1.2)
  for (y in seq(305, 353, 12)) draw_seg(90, y, 410, y, col = muted, lwd = 1.2)
  note(90, 28, "page line p: local scales 10 and 14 px")
  note(90, 283, "page line q: local scale 12 px")
  draw_seg(448, 181, 448, 305, col = accent, lwd = 2)
  draw_seg(440, 181, 456, 181, col = accent, lwd = 2)
  draw_seg(440, 305, 456, 305, col = accent, lwd = 2)
  note(466, 243, "G = 124 px")
  math(630, 116, expression(bar(s)[p * "," * q] == (10 + 14 + 12) / 3), size = 18)
  note(630, 150, "= 12 px", adj = c(0.5, 0.5))
  math(630, 208, expression(I[p * "," * q]^line == 124 / 12), size = 20)
  note(630, 244, "= 10.333 staff spaces", adj = c(0.5, 0.5))
  note(90, 414, "every stave in both page lines contributes once to the denominator")
  dev.off()
  add(34, "fig-34-local-page-line-interval")
}

# ── 35–37 · full-page warp and mutation ──
fig_35_full_page_warp <- function() {
  open_fig("fig-35-full-page-warp", 900, 390)
  frame(80, 60, 240, 180, border = muted, lwd = 1.5)
  source_corners <- list(c(80, 60), c(320, 60), c(320, 240), c(80, 240))
  for (p in source_corners) dot(p[1], p[2], col = ink, cex = 0.8)
  note(80, 272, "source W × H")
  note(80, 304, "four source corners")
  output_corners <- list(c(480, 45), c(760, 82), c(710, 288), c(438, 238))
  draw_line(c(sapply(output_corners, function(p) p[1]), output_corners[[1]][1]),
            c(sapply(output_corners, function(p) p[2]), output_corners[[1]][2]), col = accent, lwd = 2)
  for (p in output_corners) dot(p[1], p[2], col = accent, cex = 0.9)
  dashed(410, 22, 792, 22, col = muted); dashed(792, 22, 792, 326, col = muted)
  dashed(792, 326, 410, 326, col = muted); dashed(410, 326, 410, 22, col = muted)
  flow(350, 150, 420, 150)
  math(385, 126, expression(H), size = 20, adj = c(0.5, 0.5))
  note(470, 350, "expanded output: every transformed corner is inside")
  note(80, 356, "fill by H^-1 and bilinear samples")
  dev.off()
  add(35, "fig-35-full-page-warp")
}

fig_36_full_page_mutation_pipeline <- function() {
  open_fig("fig-36-full-page-mutation-pipeline", 1000, 310)
  labels <- c("geometry", "blur", "ink thickness", "illumination", "contrast", "noise")
  for (i in seq_along(labels)) {
    x <- 30 + (i - 1) * 160
    cell(x, 90, 130, 56, fill = if (i == 1) accent_soft else soft, border = if (i == 1) accent else rule)
    value_in(x, 90, 130, 56, labels[i], size = 14)
    if (i > 1) flow(x - 30, 118, x - 6, 118)
  }
  note(30, 40, "seed + exact profile + localPixelScale")
  note(30, 190, "clean: copy the bitmap and stop; operations: []")
  note(30, 226, "all other profiles: this order, with every stage recorded in metadata")
  note(30, 272, "the canonical target remains the unmutated page schema")
  dev.off()
  add(36, "fig-36-full-page-mutation-pipeline")
}

fig_37_full_page_mutation_profiles <- function() {
  open_fig("fig-37-full-page-mutation-profiles", 1000, 390)
  names <- c("clean", "screenshot", "scan-light", "scan-medium", "scan-hard")
  details <- list(
    c("scale 1", "rotation 0 deg", "blur 0", "noise 0"),
    c("scale +/-6%", "rotation 0 deg", "blur 0", "noise .001-.004"),
    c("scale +/-8%", "rotation +/-0.7 deg", "blur 0-.35 t", "noise .002-.009"),
    c("scale +/-18%", "rotation +/-2 deg", "blur .15-.75 t", "noise .006-.02"),
    c("scale +/-28%", "rotation +/-4 deg", "blur .3-1.25 t", "noise .012-.038")
  )
  for (i in seq_along(names)) {
    x <- 25 + (i - 1) * 195
    cell(x, 58, 175, 250, fill = if (i == 1) soft else accent_soft, border = if (i == 1) rule else accent)
    value_in(x, 58, 175, 42, names[i], size = 15, font = 2)
    for (j in seq_along(details[[i]])) note(x + 14, 126 + (j - 1) * 42, details[[i]][j], adj = c(0, 0.5))
  }
  note(25, 348, "blur is measured in stave-line thicknesses t; every complete range is listed in the profile table")
  dev.off()
  add(37, "fig-37-full-page-mutation-profiles")
}

# ── 38–39 · exact page and OCR evaluation ──
fig_38_canonical_page_equality <- function() {
  open_fig("fig-38-canonical-page-equality", 1000, 390)
  cell(45, 55, 250, 120, fill = soft, border = rule)
  cell(375, 55, 250, 120, fill = soft, border = rule)
  cell(745, 55, 210, 120, fill = ok_soft, border = ok)
  note(65, 40, "expected schema")
  note(395, 40, "actual schema")
  note(765, 40, "normalized values")
  mono(65, 88, "positionNumber: 2", size = 14)
  mono(65, 118, "id: 17", size = 14)
  mono(395, 88, "id: 99", size = 14)
  mono(395, 118, "positionNumber: 2", size = 14)
  mono(765, 100, "positionNumber: 2", size = 14)
  flow(300, 115, 365, 115); flow(630, 115, 735, 115)
  note(65, 216, "key order and editor ids do not matter")
  cell(45, 250, 580, 82, fill = accent_soft, border = accent)
  mono(65, 282, "actual positionNumber: 2.5", size = 14)
  mono(65, 310, "diff: $.notes[0].positionNumber  2 -> 2.5", size = 14)
  cell(745, 250, 210, 82, fill = accent_soft, border = accent)
  value_in(745, 250, 210, 82, "E = 0", size = 20, col = accent, font = 2)
  mono(765, 208, "E = 1: no differences", size = 15, col = ok)
  note(45, 366, "one remaining semantic difference rejects the whole page")
  dev.off()
  add(38, "fig-38-canonical-page-equality")
}

fig_39_ocr_whole_string_accuracy <- function() {
  open_fig("fig-39-ocr-whole-string-accuracy", 1000, 365)
  note(55, 38, "expected string")
  note(370, 38, "recognized string")
  note(790, 38, "whole-string score")
  expected <- c("Andante", "Lascia ch'io pianga", "Allegro")
  actual <- c("Andante", "Lascia ch'io piange", "Allegro")
  scores <- c(1, 0, 1)
  for (i in seq_along(expected)) {
    y <- 62 + (i - 1) * 66
    cell(45, y, 285, 48, fill = soft, border = rule)
    cell(360, y, 285, 48, fill = if (scores[i] == 1) ok_soft else accent_soft, border = if (scores[i] == 1) ok else accent)
    cell(775, y, 150, 48, fill = if (scores[i] == 1) ok_soft else accent_soft, border = if (scores[i] == 1) ok else accent)
    value_in(45, y, 285, 48, expected[i], size = 14)
    value_in(360, y, 285, 48, actual[i], size = 14)
    value_in(775, y, 150, 48, as.character(scores[i]), size = 18, col = if (scores[i] == 1) ok else accent, font = 2)
  }
  math(500, 296, expression(A[ocr] == (1 + 0 + 1) / 3 ~ "=" ~ 2 / 3), size = 22, adj = c(0.5, 0.5))
  note(500, 338, "one wrong character, or one unresolved character, scores zero", adj = c(0.5, 0.5))
  dev.off()
  add(39, "fig-39-ocr-whole-string-accuracy")
}

for (f in list(fig_00_scale_distance, fig_00_scale_thickness, fig_00_scale_thresholds,
               fig_00_scale_area, fig_00_scale_sequence,
               fig_omr_overview, fig_omr_measure, fig_omr_cross_stave,
               fig_omr_network, fig_omr_training_loop, fig_omr_data_factory,
               fig_omr_evaluation,
               fig_01_the_crop, fig_02_the_convolution_window, fig_03_the_relu_over_a_map,
               fig_04_im2col, fig_05_relu_and_pool, fig_06_the_two_slopes,
               fig_07_dense_and_softmax, fig_08_the_cost_curve, fig_09_the_two_part_cost,
               fig_10_the_initial_bell, fig_11_gradient_descent, fig_12_the_backward_pass,
               fig_13_the_stable_rewrite, fig_14_the_log_sum_exp_tangent,
               fig_15_the_last_layer_blame, fig_16_the_weight_gradient_table,
               fig_17_the_outer_product, fig_18_the_relu_gate, fig_19_the_argmax_routing,
               fig_20_the_factor_chain, fig_21_the_bias_split, fig_22_the_convolution_products,
               fig_23_col2im, fig_24_the_pull_to_zero, fig_25_the_adam_memories,
               fig_26_the_bias_correction, fig_27_the_adam_step, fig_28_the_central_difference,
               fig_29_the_check_error,
               fig_30_local_stave_space, fig_31_local_stave_thickness,
               fig_32_position_interpolation, fig_33_local_stave_interval,
               fig_34_local_page_line_interval, fig_35_full_page_warp,
               fig_36_full_page_mutation_pipeline, fig_37_full_page_mutation_profiles,
               fig_38_canonical_page_equality, fig_39_ocr_whole_string_accuracy)) f()

writeLines(manifest, file.path(out, "manifest.tsv"))
cat("figures written:", length(manifest), "\n")
