# Regenerates dev-docs/math-figures/*.svg — every graph of dev-docs/omr-math.html.
# Curves are computed from their formulas, labels use plotmath, so the figures
# are as precise as the math they show. Frames replace the old SMIL animation.
# Run: Rscript scripts/generate-math-figures.R

out <- "dev-docs/math-figures"
dir.create(out, showWarnings = FALSE, recursive = TRUE)

# ── the paper palette of the docs ──
ink <- "#17181a"; muted <- "#6b7076"; rule <- "#e4e4e0"; soft <- "#f4f3ef"
accent <- "#a5322a"; accent_soft <- "#f6e9e6"; ok <- "#2f6b3c"; ok_soft <- "#e2f0e4"

# one user unit is one hundredth of an inch; cex 1 is the 12px label size
open_fig <- function(name, w, h) {
  svg(file.path(out, paste0(name, ".svg")), width = w / 100, height = h / 100, bg = "white")
  par(mar = rep(0, 4), xpd = NA, ps = 12 * 72 / 100)
  # y grows downward, like the coordinates the figures were designed in
  plot(0, 0, type = "n", xlim = c(0, w), ylim = c(h, 0), axes = FALSE, xlab = "", ylab = "")
}

mono <- function(x, y, s, size = 12, col = ink, adj = c(0, 0.5), font = 1) {
  text(x, y, s, adj = adj, cex = size / 12, col = col, family = "mono", font = font)
}
math <- function(x, y, e, size = 14, col = ink, adj = c(0, 0.5)) {
  text(x, y, e, adj = adj, cex = size / 12, col = col)
}
note <- function(x, y, s, adj = c(0, 0.5)) mono(x, y, s, size = 11, col = muted, adj = adj)

cell <- function(x, y, w, h, fill = soft, border = rule, lwd = 1) {
  rect(x, y, x + w, y + h, col = fill, border = border, lwd = lwd)
}
hot <- function(x, y, w, h) cell(x, y, w, h, fill = accent_soft, border = accent, lwd = 1.6)
frame <- function(x, y, w, h, border = accent, lwd = 2) {
  rect(x, y, x + w, y + h, col = NA, border = border, lwd = lwd)
}
arrow <- function(x0, y0, x1, y1, col = muted, lwd = 1.4, lty = 1, length = 0.12) {
  arrows(x0, y0, x1, y1, col = col, lwd = lwd, lty = lty, length = length)
}
flow <- function(x0, y0, x1, y1, ...) arrow(x0, y0, x1, y1, col = accent, lwd = 1.8, ...)
axis_line <- function(x0, y0, x1, y1) arrow(x0, y0, x1, y1, col = muted, lwd = 1.4)
dashed <- function(x0, y0, x1, y1, col = muted) {
  segments(x0, y0, x1, y1, col = col, lwd = 1.4, lty = 2)
}

grid_of <- function(x, y, cols, rows, cw, ch, fills = NULL) {
  for (r in seq_len(rows)) for (c in seq_len(cols)) {
    f <- soft
    if (!is.null(fills)) f <- fills[r, c]
    cell(x + (c - 1) * cw, y + (r - 1) * ch, cw, ch, fill = f)
  }
}
value_in <- function(x, y, w, h, s, size = 12, col = ink, font = 1) {
  mono(x + w / 2, y + h / 2, s, size = size, col = col, adj = c(0.5, 0.5), font = font)
}
matrix_grid <- function(x, y, cols, rows, cw, ch) grid_of(x, y, cols, rows, cw, ch)

manifest <- character()
add <- function(index, name) {
  manifest <<- c(manifest, paste(index, name, sep = "\t"))
}

# ── 1 · the crop ──
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
  math(336, 106, expression(x[i * "," * j] == "the ink of this pixel"), size = 12)
  note(336, 124, "one number: 0 (paper) to 1 (ink)")
  axis_line(x0, 42, x0 + n * cw + 10, 42); math(x0 + 88, 34, expression(i))
  note(300, 46, "columns")
  axis_line(104, y0, 104, y0 + n * cw + 8); math(88, 146, expression(j))
  note(30, 150, "rows")
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
         size = 11, adj = c(0.5, 0.5))
    note(x0, 232, "window at (i, j) · offsets p, q")
    note(60, 30, "input a — 9×9, C channels")
    note(228, 106, "w"); note(244, 108, "p,q,c,k")
    arrow(262, 128, 314, 128)
    matrix_grid(330, 64, 3, 3, 26, 26)
    note(330, 34, "filter w — 3×3×C, one per k")
    note(336, 160, "weights, learned")
    note(432, 106, "+ b"); arrow(424, 118, 520, 118)
    matrix_grid(560, 60, 4, 5, 32, 26)
    note(560, 34, "output z — one cell per (i, j, k)")
    math(700, 90, expression(z[i * "," * j * "," * k]), size = 12)
    note(700, 134, "written by that window")
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
  mono(312, 90, "max(0, z)", adj = c(0.5, 0.5))
  mono(172, 172, "z — pre-activations", adj = c(0.5, 0.5))
  mono(434, 172, expression(a == max(0, z)), adj = c(0.5, 0.5))
  dev.off()
  add(3, "fig-03-the-relu-over-a-map")
}

# ── 4 · im2col ──
fig_04_im2col <- function() {
  open_fig("fig-04-im2col", 900, 250)
  matrix_grid(42, 44, 4, 10, 40, 17)
  hot(42, 134, 120, 17)
  note(42, 30, "P — patches")
  note(42, 232, "row jH + i = window at (i, j)")
  flow(168, 143, 208, 143)
  math(236, 30, expression(hat(W)^T * " — filters as columns"), size = 11)
  matrix_grid(236, 44, 4, 3, 40, 23)
  note(236, 132, "R × K")
  math(376, 84, expression("+"), adj = c(0.5, 0.5))
  cell(398, 52, 12, 54); math(394, 122, expression(1 * b^T), size = 11)
  math(452, 84, expression("="), adj = c(0.5, 0.5))
  note(500, 30, "Z — pre-activations")
  matrix_grid(500, 44, 3, 10, 32, 17)
  hot(500, 134, 32, 17)
  note(500, 232, "(HW) × K")
  note(640, 112, "one multiply replaces every")
  note(640, 126, "window sum of (2) — and the")
  note(640, 140, "derivatives come free")
  dev.off()
  add(4, "fig-04-im2col")
}

# ── 5 · ReLU and max-pool ──
fig_05_relu_and_pool <- function() {
  open_fig("fig-05-relu-and-pool", 900, 300)
  axis_line(80, 170, 560, 170); axis_line(320, 170, 320, 40)
  xs <- seq(120, 520, length.out = 200)
  lines(xs, 170 - pmax(0, xs - 320) * 0.5, col = ink, lwd = 2)
  points(320, 170, pch = 16, cex = 0.8, col = accent)
  note(160, 158, "slope 0"); note(430, 116, "slope 1")
  math(306, 56, expression(a))
  mono(470, 30, "2×2 window of a, one channel c")
  cells <- matrix(c(7, 3, 1, 2), 2, 2, byrow = TRUE)
  for (r in 1:2) for (c in 1:2) {
    cell(470 + (c - 1) * 56, 80 + (r - 1) * 60, 56, 56)
    value_in(470 + (c - 1) * 56, 80 + (r - 1) * 60, 56, 56, as.character(cells[r, c]))
  }
  hot(470, 80, 56, 56)
  arrow(600, 138, 660, 138)
  cell(680, 110, 56, 56); value_in(680, 110, 56, 56, "7", font = 2)
  mono(760, 122, expression(a^{pool[i * "," * j * "," * c]}), size = 12)
  note(760, 148, "the max wins and is remembered")
  note(760, 164, "(argmax) for the backward pass")
  dev.off()
  add(5, "fig-05-relu-and-pool")
}

# ── 6 · the two slopes ──
fig_06_the_two_slopes <- function() {
  open_fig("fig-06-the-two-slopes", 640, 225)
  axis_line(80, 170, 560, 170); axis_line(320, 170, 320, 40)
  lines(c(120, 320), c(170, 170), col = ink, lwd = 2)
  lines(c(320, 520), c(170, 70), col = ink, lwd = 2)
  points(320, 170, pch = 16, cex = 0.8, col = accent)
  note(160, 158, "slope 0"); note(430, 116, "slope 1")
  note(330, 196, "at z = 0 the slope is ε (7)")
  math(546, 190, expression(z)); math(306, 56, expression(a))
  note(100, 40, "flat left of zero, straight right of it")
  dev.off()
  add(6, "fig-06-the-two-slopes")
}

# ── 7 · dense and softmax ──
fig_07_dense_and_softmax <- function() {
  open_fig("fig-07-dense-and-softmax", 900, 300)
  for (y in c(62, 110, 158)) { rect(80 - 16, y - 16, 80 + 16, y + 16, col = "white", border = muted) }
  for (y in c(86, 134)) { rect(350 - 16, y - 16, 350 + 16, y + 16, col = accent_soft, border = accent) }
  for (y0 in c(62, 110, 158)) for (y1 in c(86, 134)) dashed(96, y0, 334, y1)
  math(50, 26, expression(a^{(l - 1)}), size = 12); math(342, 26, expression(z^{(l)}), size = 12)
  mono(188, 80, expression(W^{(l)}), size = 12, adj = c(0.5, 0.5))
  math(392, 86, expression("+" ~ b^{(l)}), size = 12)
  note(84, 190, "every input into every output")
  # scores → probabilities
  note(520, 40, "scores z become probabilities p")
  zb <- c(46, 64, 30, 76)
  for (i in 1:4) cell(520 + (i - 1) * 34, 190 - zb[i], 26, zb[i])
  math(520, 212, expression(z[1 * ":" * K]), size = 11)
  flow(670, 152, 708, 152)
  mono(689, 136, "softmax", adj = c(0.5, 0.5))
  pb <- c(36, 52, 20, 60)
  for (i in 1:4) hot(720 + (i - 1) * 34, 190 - pb[i], 26, pb[i])
  math(720, 212, expression(p[1 * ":" * K]), size = 11)
  note(772, 212, "· sums to 1")
  note(520, 242, "one score per class, c")
  note(520, 258, "bar height = probability")
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
  lines(px(ps), py(ps), col = ink, lwd = 2)
  for (p in c(0.01, 0.5, 1)) {
    points(px(p), py(p), pch = 21, bg = accent, col = "white", lwd = 2, cex = 1.2)
  }
  text(px(0.01) + 12, py(0.01) - 4, expression(p == 0.01 %->% "cost 4.6"), adj = c(0, 0.5), cex = 11 / 12, col = muted, family = "mono")
  text(px(0.5) - 34, py(0.5) + 26, expression(p == 0.5 %->% 0.69), adj = c(0, 0.5), cex = 11 / 12, col = muted, family = "mono")
  text(px(1) - 40, py(1) - 14, expression(p == 1 %->% "cost 0"), adj = c(0, 0.5), cex = 11 / 12, col = muted, family = "mono")
  note(380, 60, "−log p: confident and wrong")
  note(380, 76, "is punished hard")
  note(496, 212, expression(p[y] %->% 1), adj = c(0.5, 0.5))
  math(18, 34, expression(C))
  dev.off()
  add(8, "fig-08-the-cost-curve")
}

# ── 9 · the two-part cost ──
fig_09_the_two_part_cost <- function() {
  open_fig("fig-09-the-two-part-cost", 640, 215)
  note(60, 46, "the cost of (12) is two parts")
  cell(60, 70, 330, 52); hot(390, 70, 90, 52)
  mono(225, 148, "cross-entropy: the fit of p to the truth", adj = c(0.5, 0.5))
  math(435, 148, expression(lambda * Sigma * theta^2), size = 12, adj = c(0.5, 0.5))
  note(60, 186, "the penalty is small but never zero: it keeps the weights from drifting")
  dev.off()
  add(9, "fig-09-the-two-part-cost")
}

# ── 10 · the initial bell ──
fig_10_the_initial_bell <- function() {
  open_fig("fig-10-the-initial-bell", 640, 245)
  axis_line(60, 180, 580, 180); axis_line(320, 180, 320, 30)
  x <- seq(-3, 3, length.out = 300)
  lines(320 + x * 73, 180 - dnorm(x) / dnorm(0) * 120, col = ink, lwd = 2)
  dashed(320 - 73, 180, 320 - 73, 132); dashed(320 + 73, 180, 320 + 73, 132)
  math(238, 200, expression(-sigma), size = 12, adj = c(0.5, 0.5)); mono(320, 200, "0", adj = c(0.5, 0.5))
  math(394, 200, expression(sigma), size = 12, adj = c(0.5, 0.5))
  math(320, 230, expression(sigma == sqrt(2 / "fan-in")), size = 12, adj = c(0.5, 0.5))
  note(100, 46, "weights start small and centred; biases start at 0")
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
    open_fig(name, 720, 260)
    t <- seq(0, 1, length.out = 300)
    lines(xs(t), ys(t), col = ink, lwd = 2)
    if (k > 1) for (i in 1:(k - 1)) {
      dashed(xs(steps[i]), ys(steps[i]) + 26, xs(steps[i + 1]), ys(steps[i + 1]) + 26)
    }
    points(xs(tmin), ys(tmin), pch = 16, cex = 0.8, col = ok)
    note(xs(tmin) - 44, ys(tmin) + 26, "minimum of C", adj = c(0.5, 0.5))
    points(xs(steps[k]), ys(steps[k]), pch = 21, bg = accent, col = "white", lwd = 2, cex = 1.3)
    if (k > 1) math(xs(steps[k - 1]) + 12, ys(steps[k - 1]) + 44, expression(-eta * g), size = 11, col = muted)
    note(386, 236, "step against the slope")
    mono(60, 24, expression(C(theta) ~ "— the cost as one number" ~ theta ~ "moves"), size = 11)
    dev.off()
    add(11, name)
  }
}

# ── 12 · the backward pass, five frames ──
fig_12_the_backward_pass <- function() {
  labels <- list(expression(a^{(l - 1)}), expression(W^{(l)}), expression(z^{(l)}), "ReLU", "softmax", "cost C")
  bx <- c(20, 160, 300, 440, 580, 720); bw <- c(rep(110, 5), 120)
  for (k in 1:5) {
    name <- paste0("fig-12-the-backward-pass-", k)
    open_fig(name, 960, 200)
    for (i in 1:6) {
      lit <- (i == 6 - k + 1)
      cell(bx[i], 60, bw[i], 42, fill = if (lit) ok_soft else if (i == 6) accent_soft else "white",
           border = if (lit) ok else muted, lwd = if (lit) 2 else 1)
      mono(bx[i] + bw[i] / 2, 86, labels[[i]], size = 13, adj = c(0.5, 0.5))
    }
    axis_line(130, 46, 714, 46)
    mono(380, 38, "forward: the answer", adj = c(0.5, 0.5))
    flow(720, 128, 86, 128)
    mono(330, 152, "backward: blame, one factor per stage", adj = c(0.5, 0.5))
    tok_x <- c(720, 600, 460, 320, 180)[k]
    points(tok_x, 128, pch = 21, bg = ok, col = "white", lwd = 2, cex = 1.3)
    note(30, 178, "the error signal arrives at each stage, which multiplies it by its own input")
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
  text(330, 150, expression(log ~ Sigma ~ e^z ~ " — all scores push up"), adj = c(0, 0.5), cex = 11 / 12, col = muted)
  text(330, 172, expression(-z[y] ~ " — the true score pulls down"), adj = c(0, 0.5), cex = 11 / 12, col = muted)
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
  lines(100 + (z + 2.2) * 100, 180 - (f(z) - f(-2.2)) / (f(2.6) - f(-2.2)) * 130, col = ink, lwd = 2)
  z0 <- 0.6
  px <- 100 + (z0 + 2.2) * 100; py <- 180 - (f(z0) - f(-2.2)) / (f(2.6) - f(-2.2)) * 130
  slope <- exp(z0) / (exp(z0) + exp(1.2))
  sv <- slope * (130 / (f(2.6) - f(-2.2))) / 100
  segments(px - 80, py + 80 * sv, px + 80, py - 80 * sv, col = muted, lwd = 1.4, lty = 2)
  points(px, py, pch = 16, cex = 0.9, col = accent)
  note(px + 12, 172, "tangent slope = p_c")
  note(110, 212, "z_c →")
  mono(72, 46, "log Σ e^z", size = 11)
  note(100, 234, "differentiating the normalizer returns the softmax itself (17)")
  dev.off()
  add(14, "fig-14-the-log-sum-exp-tangent")
}

# ── 15 · the last layer's blame ──
fig_15_the_last_layer_blame <- function() {
  open_fig("fig-15-the-last-layer-blame", 900, 290)
  mono(135, 56, "p — probabilities (10)", adj = c(0.5, 0.5))
  mono(365, 56, "onehot(y) — the truth", adj = c(0.5, 0.5))
  math(610, 56, expression(delta^{(L)} == p - onehot(y)), size = 12, adj = c(0.5, 0.5))
  mono(610, 76, "— the blame (18)", adj = c(0.5, 0.5))
  math(250, 208, expression("-")); math(480, 208, expression("="))
  dashed(55, 200, 215, 200); dashed(285, 200, 445, 200); dashed(515, 200, 675, 200)
  p <- c(26, 44, 16, 34, 20)
  for (i in 1:5) cell(60 + (i - 1) * 30, 200 - p[i], 24, p[i])
  for (i in 1:5) if (i == 3) hot(350, 140, 24, 60) else cell(290 + (i - 1) * 30, 197, 24, 3)
  for (i in 1:5) {
    if (i == 3) hot(580, 200, 24, 44) else cell(520 + (i - 1) * 30, 200 - p[i], 24, p[i])
  }
  note(520, 272, "one entry is negative — the truth was not certain enough")
  dev.off()
  add(15, "fig-15-the-last-layer-blame")
}

# ── 16 · the weight gradient table ──
fig_16_the_weight_gradient_table <- function() {
  open_fig("fig-16-the-weight-gradient-table", 640, 235)
  note(70, 36, "one row and one column meet in one number (19)")
  for (r in 1:5) cell(110, 70 + (r - 1) * 24, 36, 24)
  hot(110, 118, 36, 24)
  for (c in 1:5) cell(160 + (c - 1) * 36, 30, 36, 32)
  hot(232, 30, 36, 32)
  for (r in 1:5) for (c in 1:5) cell(160 + (c - 1) * 36, 70 + (r - 1) * 24, 36, 24)
  hot(232, 118, 36, 24)
  math(128, 22, expression(delta)); math(358, 50, expression(a))
  mono(380, 110, expression(dW[j * "," * k] == delta[j] %.% a[k]), size = 12)
  note(380, 130, "the row factor times the column factor")
  dev.off()
  add(16, "fig-16-the-weight-gradient-table")
}

# ── 17 · the outer product ──
fig_17_the_outer_product <- function() {
  open_fig("fig-17-the-outer-product", 800, 225)
  for (r in 1:5) cell(70, 50 + (r - 1) * 24, 36, 24)
  for (c in 1:5) cell(170 + (c - 1) * 24, 88, 24, 32)
  for (r in 1:5) for (c in 1:5) cell(350 + (c - 1) * 32, 50 + (r - 1) * 24, 32, 24)
  math(88, 42, expression(delta), adj = c(0.5, 0.5))
  math(230, 42, expression(a^T), adj = c(0.5, 0.5))
  math(430, 42, expression(dW == delta ~ a^T), adj = c(0.5, 0.5))
  mono(136, 114, "\u00d7", size = 14, adj = c(0.5, 0.5))
  math(320, 114, expression("="), adj = c(0.5, 0.5))
  note(88, 192, "(K × 1)", adj = c(0.5, 0.5))
  note(230, 192, "(1 × N)", adj = c(0.5, 0.5))
  note(430, 192, "(K × N)", adj = c(0.5, 0.5))
  mono(560, 100, expression(dW == delta ~ a^T), size = 12)
  mono(560, 122, expression(db == delta), size = 12)
  mono(560, 144, expression(da == W^T ~ delta), size = 12)
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
    if (dz[i] == 0) hot(60 + (i - 1) * 44, 170, 44, 30) else cell(60 + (i - 1) * 44, 170, 44, 30)
    value_in(60 + (i - 1) * 44, 170, 44, 30, dz[i])
  }
  mono(360, 88, expression(delta * a), size = 12); note(360, 104, "— arriving")
  mono(360, 138, "1[z > 0] — the gate", size = 12)
  mono(360, 188, expression(delta * z == delta * a %.% gate), size = 12)
  dev.off()
  add(18, "fig-18-the-relu-gate")
}

# ── 19 · the argmax routing ──
fig_19_the_argmax_routing <- function() {
  open_fig("fig-19-the-argmax-routing", 640, 258)
  note(60, 36, "max-pool (22): blame goes only to the remembered argmax")
  vals <- matrix(c(7, 3, 1, 2), 2, 2, byrow = TRUE)
  for (r in 1:2) for (c in 1:2) {
    cell(120 + (c - 1) * 60, 70 + (r - 1) * 60, 60, 60)
    value_in(120 + (c - 1) * 60, 70 + (r - 1) * 60, 60, 60, vals[r, c])
  }
  hot(120, 70, 60, 60)
  flow(258, 130, 352, 130)
  mono(305, 116, "argmax", adj = c(0.5, 0.5))
  for (r in 1:2) for (c in 1:2) {
    cell(380 + (c - 1) * 60, 70 + (r - 1) * 60, 60, 60)
    if (r == 1 && c == 1) math(410, 100, expression(delta * a), size = 12, adj = c(0.5, 0.5)) else value_in(380 + (c - 1) * 60, 70 + (r - 1) * 60, 60, 60, "0")
  }
  note(180, 214, "values before pooling (8)", adj = c(0.5, 0.5))
  note(440, 214, "blame after (22)", adj = c(0.5, 0.5))
  note(60, 238, "the three losers get 0: they never touched the output")
  dev.off()
  add(19, "fig-19-the-argmax-routing")
}

# ── 20 · the factor chain ──
fig_20_the_factor_chain <- function() {
  open_fig("fig-20-the-factor-chain", 900, 215)
  note(250, 40, "every stage contributes one factor — read right to left (23)")
  boxes <- list(expression(delta^{(L)}), bquote("×" ~ W^{(L) * T}), "gate", bquote("×" ~ W^T), "gate", bquote("×" ~ a^{(l - 1) * T}))
  bx <- c(770, 620, 470, 320, 170, 20)
  for (i in 1:6) {
    cell(bx[i], 70, 110, 40, fill = "white", border = muted)
    mono(bx[i] + 55, 95, boxes[[i]], size = 13, adj = c(0.5, 0.5))
  }
  for (x in c(762, 612, 462, 312, 162)) flow(x, 90, x - 22, 90)
  note(20, 168, "two factors per layer: a gate, then a transpose")
  text(20, 190, expression("×" ~ a^T ~ "turns the blame into the weight gradient"), adj = c(0, 0.5), cex = 11 / 12, col = muted)
  dev.off()
  add(20, "fig-20-the-factor-chain")
}

# ── 21 · the bias split ──
fig_21_the_bias_split <- function() {
  open_fig("fig-21-the-bias-split", 640, 235)
  note(80, 36, "blame leaves the sum node: scaled to W, unchanged to b")
  cell(80, 60, 110, 40, fill = "white", border = muted)
  cell(80, 150, 110, 40, fill = "white", border = muted)
  mono(135, 85, expression(W), size = 13, adj = c(0.5, 0.5))
  mono(135, 175, expression(b), size = 13, adj = c(0.5, 0.5))
  hot(420, 105, 110, 40)
  mono(475, 130, expression(delta), size = 13, adj = c(0.5, 0.5))
  flow(416, 116, 200, 84); flow(416, 136, 200, 168)
  math(300, 92, expression("×" ~ a %->% dW), size = 12, adj = c(0.5, 0.5))
  math(300, 176, expression("×" ~ 1 %->% db == delta), size = 12, adj = c(0.5, 0.5))
  note(80, 218, "a bias is a pure shift: its coefficient is 1, so the blame arrives untouched")
  dev.off()
  add(21, "fig-21-the-bias-split")
}

# ── 22 · the convolution's products ──
fig_22_the_convolution_products <- function() {
  open_fig("fig-22-the-convolution-products", 900, 215)
  note(40, 36, "the convolution's gradients are matrix products (25)")
  matrix_grid(60, 60, 2, 3, 36, 30)
  mono(98, 52, expression(D^T), adj = c(0.5, 0.5)); note(98, 172, "(K × HW)", adj = c(0.5, 0.5))
  mono(160, 100, "\u00d7", size = 14, adj = c(0.5, 0.5))
  matrix_grid(200, 60, 4, 3, 30, 30)
  mono(260, 52, expression(P), adj = c(0.5, 0.5)); note(260, 172, "(HW × R)", adj = c(0.5, 0.5))
  math(350, 100, expression("="), adj = c(0.5, 0.5))
  matrix_grid(390, 60, 3, 3, 36, 30)
  mono(446, 52, expression(d * hat(W)), adj = c(0.5, 0.5)); note(446, 172, "(K × R)", adj = c(0.5, 0.5))
  mono(560, 92, expression(db == 1^T ~ D), size = 12)
  note(700, 92, "— column sums")
  mono(560, 114, expression(dP == D ~ hat(W)), size = 12)
  note(700, 114, "— patch blame")
  note(560, 144, "patches overlap: col2im (26) adds them up")
  dev.off()
  add(22, "fig-22-the-convolution-products")
}

# ── 23 · col2im ──
fig_23_col2im <- function() {
  open_fig("fig-23-col2im", 700, 235)
  note(220, 30, "one cell, two windows: the blames add — (26)")
  grid_of(220, 40, 6, 6, 24, 24)
  hot(268, 88, 48, 48)
  frame(244, 64, 72, 72); frame(268, 88, 72, 72)
  hot(268, 88, 24, 24)
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
  open_fig("fig-24-the-pull-to-zero", 640, 245)
  axis_line(80, 180, 560, 180); axis_line(320, 180, 320, 40)
  lines(c(160, 480), c(228, 132), col = ink, lwd = 2)
  flow(250, 210, 305, 192); flow(420, 148, 365, 166)
  math(492, 130, expression(2 * lambda * theta)); math(546, 198, expression(theta))
  mono(312, 198, "0", adj = c(0.5, 0.5))
  note(100, 60, "the penalty's pull grows with the weight")
  note(100, 232, "farther from zero, the harder it pulls home — (27)")
  dev.off()
  add(24, "fig-24-the-pull-to-zero")
}

# ── 25 · the Adam memories ──
fig_25_the_adam_memories <- function() {
  open_fig("fig-25-the-adam-memories", 900, 270)
  g <- c(52, -20, 44, -52, 30, 60, -40, 22, 50, -30)
  m <- numeric(length(g)); acc <- 0
  for (i in seq_along(g)) { acc <- 0.9 * acc + 0.1 * g[i]; m[i] <- acc }
  x <- 100 + (seq_along(g) - 1) * 60
  dashed(80, 140, 720, 140)
  segments(x, 140, x, 140 - g, col = muted, lwd = 2)
  lines(x, 140 - m * 2, col = ink, lwd = 2)
  note(100, 30, "g_t — this step's noise")
  note(100, 50, "m_t — smoothed direction")
  note(100, 70, "v_t — smoothed scale")
  text(100, 238, expression(beta[1] == 0.9 ~ "keeps the past;" ~ beta[2] == 0.999 ~ "keeps even more of it — (28)"), adj = c(0, 0.5), cex = 11 / 12, col = muted)
  dev.off()
  add(25, "fig-25-the-adam-memories")
}

# ── 26 · the bias correction ──
fig_26_the_bias_correction <- function() {
  open_fig("fig-26-the-bias-correction", 700, 255)
  axis_line(80, 200, 640, 200); axis_line(100, 200, 100, 40)
  t <- 1:9
  raw <- 1 - 0.9^t
  x <- 120 + (t - 1) * 60
  dashed(100, 100, 620, 100)
  lines(x, 190 - raw * 88, col = ink, lwd = 2)
  lines(x, rep(100, length(t)), col = ink, lwd = 2, lty = 2)
  math(128, 84, expression(hat(m))); math(256, 168, expression(m))
  note(430, 92, "the true direction E[g]")
  note(100, 236, "without the correction the first steps would barely move (29)")
  dev.off()
  add(26, "fig-26-the-bias-correction")
}

# ── 27 · the Adam step ──
fig_27_the_adam_step <- function() {
  open_fig("fig-27-the-adam-step", 700, 235)
  axis_line(80, 170, 620, 170)
  points(420, 170, pch = 16, cex = 0.9, col = accent)
  points(280, 170, pch = 16, cex = 0.9, col = ok)
  flow(415, 132, 295, 132)
  mono(355, 118, expression("step =" ~ eta %.% hat(m) / (sqrt(hat(v)) + epsilon)),
       size = 12, adj = c(0.5, 0.5))
  math(420, 196, expression(theta[t - 1]), size = 12, adj = c(0.5, 0.5)); math(280, 196, expression(theta[t]), size = 12, adj = c(0.5, 0.5))
  note(80, 56, "the direction comes from the corrected m, the size from the corrected v (30)")
  text(80, 218, expression(eta ~ "scales the whole move;" ~ epsilon ~ "only guards the division"), adj = c(0, 0.5), cex = 11 / 12, col = muted)
  dev.off()
  add(27, "fig-27-the-adam-step")
}

# ── 28 · the central difference ──
fig_28_the_central_difference <- function() {
  open_fig("fig-28-the-central-difference", 640, 262)
  f <- function(x) x^2 + 0.25 * x^3
  px <- function(x) 300 + x * 110
  py <- function(x) 200 - f(x) * 12
  x <- seq(-2, 2, length.out = 300)
  lines(px(x), py(x), col = ink, lwd = 2)
  x0 <- -0.6; e <- 0.9
  for (s in c(x0 - e, x0 + e)) points(px(s), py(s), pch = 16, cex = 0.9, col = accent)
  tv <- (2 * x0 + 0.75 * x0^2) * 12 / 110
  segments(px(x0) - 90, py(x0) + 90 * tv, px(x0) + 90, py(x0) - 90 * tv,
           col = muted, lwd = 1.4, lty = 2)
  sv <- (py(x0 + e) - py(x0 - e)) / (px(x0 + e) - px(x0 - e))
  segments(px(x0 - e) - 90, py(x0 - e) - 90 * sv, px(x0 + e) + 90, py(x0 + e) + 90 * sv,
           col = muted, lwd = 1.4, lty = 2)
  math(135, 216, expression(theta - epsilon), size = 12, adj = c(0.5, 0.5)); math(333, 226, expression(theta + epsilon), size = 12, adj = c(0.5, 0.5))
  math(px(x0) - 8, py(x0) + 32, expression(theta), size = 12, adj = c(0.5, 0.5))
  mono(250, 168, "tangent"); mono(408, 222, "secant")
  text(60, 248, expression("the gap between them is" ~ O(epsilon^2) ~ ", by Taylor's expansion"), adj = c(0, 0.5), cex = 11 / 12, col = muted)
  dev.off()
  add(28, "fig-28-the-central-difference")
}

# ── 29 · the check error ──
fig_29_the_check_error <- function() {
  open_fig("fig-29-the-check-error", 640, 255)
  axis_line(80, 190, 560, 190)
  hot(180, 70, 60, 120); hot(340, 160, 60, 30)
  mono(210, 58, "error at ε", adj = c(0.5, 0.5))
  mono(370, 148, "error at ε/2", adj = c(0.5, 0.5))
  math(210, 212, expression(epsilon^2), size = 11, col = muted, adj = c(0.5, 0.5)); math(370, 212, expression(epsilon^2 / 4), size = 11, col = muted, adj = c(0.5, 0.5))
  text(140, 40, expression("halve" ~ epsilon ~ ": the error drops fourfold (32)"), adj = c(0, 0.5), cex = 11 / 12, col = muted)
  note(100, 244, "the check gets sharper fast — but too small an ε re-enters rounding")
  dev.off()
  add(29, "fig-29-the-check-error")
}

for (f in list(fig_01_the_crop, fig_02_the_convolution_window, fig_03_the_relu_over_a_map,
               fig_04_im2col, fig_05_relu_and_pool, fig_06_the_two_slopes,
               fig_07_dense_and_softmax, fig_08_the_cost_curve, fig_09_the_two_part_cost,
               fig_10_the_initial_bell, fig_11_gradient_descent, fig_12_the_backward_pass,
               fig_13_the_stable_rewrite, fig_14_the_log_sum_exp_tangent,
               fig_15_the_last_layer_blame, fig_16_the_weight_gradient_table,
               fig_17_the_outer_product, fig_18_the_relu_gate, fig_19_the_argmax_routing,
               fig_20_the_factor_chain, fig_21_the_bias_split, fig_22_the_convolution_products,
               fig_23_col2im, fig_24_the_pull_to_zero, fig_25_the_adam_memories,
               fig_26_the_bias_correction, fig_27_the_adam_step, fig_28_the_central_difference,
               fig_29_the_check_error)) f()

writeLines(manifest, file.path(out, "manifest.tsv"))
cat("figures written:", length(manifest), "\n")
