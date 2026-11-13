
(function () {
  const S = __S__;

  const treeBox = document.getElementById('tree');
  const scroller = document.querySelector('.scrollbox');

  // the folder structure is built once per tab; only the highlight moves
  let treeFor = -1, rowByFile = {}, activePath = null;
  function drawTree(sc) {
    if (treeFor === si) return;
    treeFor = si;
    activePath = null;
    const root = { dirs: new Map(), files: [] };
    for (const path of sc.files) {
      const parts = path.split('/');
      const name = parts.pop();
      let at = root;
      for (const p of parts) {
        if (!at.dirs.has(p)) at.dirs.set(p, { dirs: new Map(), files: [] });
        at = at.dirs.get(p);
      }
      at.files.push({ name: name, path: path });
    }
    treeBox.innerHTML = '';
    rowByFile = {};
    const row = (depth, text, cls, path) => {
      const d = document.createElement('div');
      d.className = 'trow ' + cls;
      d.style.paddingLeft = (10 + depth * 16) + 'px';
      d.textContent = text;
      if (path) {
        d.title = path + ' — click to jump to its first frame';
        d.addEventListener('click', () => jumpToFile(path));
        rowByFile[path] = d;
      }
      treeBox.appendChild(d);
    };
    const walk = (at, depth) => {
      [...at.dirs.keys()].sort().forEach(name => {
        row(depth, name + '/', 'dir');
        walk(at.dirs.get(name), depth + 1);
      });
      at.files.sort((a, b) => a.name < b.name ? -1 : 1)
        .forEach(f => row(depth, f.name, 'file', f.path));
    };
    walk(root, 0);
  }

  const files = {};
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KEYWORDS = /\b(const|let|var|function|return|if|else|for|while|of|in|new|import|export|from|default|class|extends|async|await|try|catch|finally|throw|typeof|instanceof|null|undefined|true|false|this|switch|case|break|continue|delete|void|yield|static|get|set)\b/;
  function highlightJs(src) {
    const re = new RegExp(
      '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)' +
      "|('(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\"|`(?:\\\\.|[^`\\\\])*`)" +
      '|(0x[\\da-fA-F]+|\\d+(?:\\.\\d+)?)' +
      '|' + KEYWORDS.source, 'g');
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += '<span class="hljs-comment">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="hljs-string">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="hljs-number">' + esc(m[3]) + '</span>';
      else out += '<span class="hljs-keyword">' + esc(m[4]) + '</span>';
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  function splitLines(html) {
    const out = []; const open = []; let cur = '';
    const re = /(<span[^>]*>)|(<\/span>)|(\n)|([^<\n]+)/g; let m;
    while ((m = re.exec(html))) {
      if (m[1]) { open.push(m[1]); cur += m[1]; }
      else if (m[2]) { open.pop(); cur += m[2]; }
      else if (m[3]) { cur += '</span>'.repeat(open.length); out.push(cur); cur = open.join(''); }
      else cur += m[4];
    }
    out.push(cur); return out;
  }
  function getFile(key) {
    if (files[key]) return files[key];
    const s = document.getElementById('src-' + key);
    const raw = s.textContent.replace(/^\n/, '').replace(/\n$/, '');
    files[key] = { path: s.dataset.path, start: +s.dataset.start, lines: splitLines(highlightJs(raw)) };
    return files[key];
  }
  const codeOl = document.getElementById('code'), codeBox = document.getElementById('codebox');
  let shownFile = null;
  function showCode(key, range) {
    const f = getFile(key);
    if (shownFile !== key) {
      codeOl.innerHTML = f.lines.map((ln, i) =>
        `<li data-n="${f.start + i}"><span class="n">${f.start + i}</span><code>${ln || ' '}</code></li>`).join('');
      shownFile = key;
    }
    document.getElementById('fpath').textContent = f.path;
    document.getElementById('frepo').textContent = 'MuSemantiQ';
    document.getElementById('flines').textContent = range ? `lines ${range[0]}–${range[1]}` : '';
    let first = null;
    codeOl.querySelectorAll('li').forEach(li => {
      const n = +li.dataset.n; const on = range && n >= range[0] && n <= range[1];
      li.classList.toggle('hl', !!on); if (on && !first) first = li;
    });
    if (first) codeBox.scrollTo({ top: Math.max(0, first.offsetTop - 70), behavior: 'smooth' });
  }

  const msgEl = document.getElementById('msg'), workerEl = document.getElementById('worker');
  function showState(fr) {
    msgEl.textContent = fr.msg ? JSON.stringify(fr.msg, null, 2) : '—';
    const w = fr.w || {};
    const rest = Object.entries(w).filter(([k]) => k !== 'stack' && k !== 'call stack')
      .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(String(v))}</dd>`).join('');
    const stack = w.stack || (w['call stack'] ? String(w['call stack']).split(' → ') : null);
    workerEl.innerHTML = (stack
      ? `<div class="stack">` + stack.map((s, i) =>
          `<div class="frame${i === stack.length - 1 ? ' here' : ''}">${esc(s)}</div>`).join('') + `</div>`
      : '<dt>—</dt><dd>nothing new in this frame</dd>') + rest;
    const logEl = document.getElementById('logline');
    if (logEl) logEl.textContent = fr.log || '—';
  }

  function jumpToFile(path) {
    stop();
    const i = S[si].frames.findIndex(f => f.f.split('#')[0] === path);
    if (i >= 0) fi = i;
    render();
  }
  // a call stack can span several files: the deepest one is the current
  // file (green), the files above it stay tinted
  function scrollToActive() {
    const fs = S[si].frames[fi].fs || [];
    const cur = fs[fs.length - 1];
    const r = cur && rowByFile[cur];
    if (!r) return;
    const out = r.offsetTop < scroller.scrollTop || r.offsetTop + r.offsetHeight > scroller.scrollTop + scroller.clientHeight;
    if (cur !== activePath || out) {
      activePath = cur;
      scroller.scrollTo({ top: Math.max(0, r.offsetTop - scroller.clientHeight / 2 + r.offsetHeight / 2), behavior: 'smooth' });
    }
  }

  let si = 0, fi = 0, timer = null;
  const tabs = document.getElementById('tabs'), scrub = document.getElementById('scrub');
  S.forEach((sc, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.role = 'tab'; b.id = 'tab-' + i;
    b.textContent = sc.name; b.addEventListener('click', () => { stop(); si = i; fi = 0; render(); });
    tabs.appendChild(b);
  });
  function render() {
    const sc = S[si], fr = sc.frames[fi];
    [...tabs.children].forEach((b, i) => b.setAttribute('aria-selected', i === si ? 'true' : 'false'));
    scrub.max = sc.frames.length - 1; scrub.value = fi;
    document.getElementById('count').textContent = `${fi + 1} / ${sc.frames.length}`;
    document.getElementById('ctitle').textContent = fr.t;
    document.getElementById('ctext').textContent = fr.x;
    drawTree(sc);
    const fs = fr.fs || [], cur = fs[fs.length - 1];
    for (const p in rowByFile) {
      rowByFile[p].className = 'trow file' + (p === cur ? ' on' : fs.includes(p) ? ' in' : '');
    }
    document.getElementById('where').textContent = cur || fr.f.split('#')[0];
    showState(fr);
    showCode(fr.f, fr.l);
    scrollToActive();
    document.getElementById('prev').disabled = document.getElementById('first').disabled = fi === 0;
    document.getElementById('next').disabled = fi === sc.frames.length - 1;
  }
  const go = d => { const n = S[si].frames.length; fi = Math.max(0, Math.min(n - 1, fi + d)); render(); };
  function stop() { if (timer) { clearInterval(timer); timer = null; } const p = document.getElementById('play'); p.textContent = '▶ Play'; p.setAttribute('aria-label', 'Play'); }
  function play() {
    if (fi === S[si].frames.length - 1) { fi = 0; render(); }
    const p = document.getElementById('play'); p.textContent = '❚❚ Pause'; p.setAttribute('aria-label', 'Pause');
    timer = setInterval(() => { if (fi >= S[si].frames.length - 1) return stop(); go(1); }, 2400);
  }
  document.getElementById('play').addEventListener('click', () => timer ? stop() : play());
  document.getElementById('next').addEventListener('click', () => { stop(); go(1); });
  document.getElementById('prev').addEventListener('click', () => { stop(); go(-1); });
  document.getElementById('first').addEventListener('click', () => { stop(); fi = 0; render(); });
  scrub.addEventListener('input', () => { stop(); fi = +scrub.value; render(); });
  document.addEventListener('keydown', e => {
    if (e.target === scrub) return;
    if (e.key === 'ArrowRight') { stop(); go(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { stop(); go(-1); e.preventDefault(); }
    else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { timer ? stop() : play(); e.preventDefault(); }
  });

  render();
})();
