/* ------------------------------------------------------------------
   Command palette — Cmd/Ctrl+K full-text search across all 39 questions.
   Indexes every topic's markdown, ranks results, and navigates via the
   main app's router. Works offline; no external deps.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  const RECENT_KEY = 'statna-skuska:recent:v1';
  const RECENT_MAX = 6;
  const RESULTS_MAX = 40;

  // ---------- text helpers ----------
  function slugify(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '').slice(0, 60);
  }
  function normalize(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function cleanInlineMarkdown(s) {
    return String(s || '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function loadRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (_) { return []; }
  }
  function pushRecent(qnum) {
    const cur = loadRecent().filter(n => n !== qnum);
    cur.unshift(qnum);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, RECENT_MAX))); } catch (_) {}
  }

  // ---------- markdown → searchable docs ----------
  // Each doc is a searchable chunk: question title, h4 heading, or a prose
  // paragraph anchored to the nearest h4. Offsets into the ORIGINAL text
  // match offsets into the normalized text 1:1 for Slovak (each precomposed
  // diacritic char decomposes to base + combining, which collapses back
  // into 1 base char after stripping marks).
  function parseMarkdownIntoDocs(md, topic) {
    const out = [];
    const lines = md.split('\n');
    let currentQ = null;
    let currentH4 = null;
    let h4Used = new Set();
    let buf = [];

    const flush = () => {
      if (!currentQ || !buf.length) { buf = []; return; }
      const text = buf.join(' ').replace(/\s+/g, ' ').trim();
      buf = [];
      if (!text) return;
      out.push({
        type: 'body',
        topic,
        qnum: currentQ.qnum,
        qtitle: currentQ.title,
        h4: currentH4 ? currentH4.text : null,
        headingId: currentH4 ? currentH4.id : `q-${currentQ.qnum}`,
        text,
        norm: normalize(text),
      });
    };

    let inFence = false;
    for (const raw of lines) {
      const line = raw.trim();

      if (/^```/.test(line)) { inFence = !inFence; continue; }
      if (inFence) continue;

      if (line.startsWith('### ')) {
        flush();
        const rest = line.slice(4).trim();
        const m = rest.match(/^(\d+)\.\s+(.+)$/);
        if (m) {
          const title = cleanInlineMarkdown(m[2]);
          currentQ = { qnum: Number(m[1]), title };
          currentH4 = null;
          h4Used = new Set();
          out.push({
            type: 'title',
            topic,
            qnum: currentQ.qnum,
            qtitle: currentQ.title,
            h4: null,
            headingId: `q-${currentQ.qnum}`,
            text: currentQ.title,
            norm: normalize(currentQ.title),
          });
        }
        continue;
      }

      if (line.startsWith('#### ') && currentQ) {
        flush();
        const text = line.slice(5).trim();
        const base = `q-${currentQ.qnum}-${slugify(text)}`;
        let id = base, n = 2;
        while (h4Used.has(id)) id = `${base}-${n++}`;
        h4Used.add(id);
        currentH4 = { text, id };
        out.push({
          type: 'h4',
          topic,
          qnum: currentQ.qnum,
          qtitle: currentQ.title,
          h4: text,
          headingId: id,
          text,
          norm: normalize(text),
        });
        continue;
      }

      if (line.startsWith('##### ')) { flush(); continue; }
      if (line.startsWith('## ')) { flush(); continue; }

      if (!line) { flush(); continue; }

      const clean = line
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^[-*+]\s+/, '')
        .replace(/^>\s+/, '')
        .replace(/^#{1,6}\s+/, '');
      buf.push(clean);
    }
    flush();
    return out;
  }

  // ---------- index lifecycle ----------
  let docs = null;
  let indexBuilding = false;
  let indexReady = false;

  async function buildIndex() {
    const api = window.StatnaSkuska;
    if (!api) return;
    if (indexReady || indexBuilding) return;
    indexBuilding = true;
    try {
      const mds = await Promise.all(api.EXAM_TOPICS.map(o => api.getMarkdown(o.slug)));
      const all = [];
      mds.forEach((md, i) => {
        all.push(...parseMarkdownIntoDocs(md, api.EXAM_TOPICS[i]));
      });
      docs = all;
      indexReady = true;
      if (isOpen) runSearch();
    } finally {
      indexBuilding = false;
    }
  }

  // ---------- scoring ----------
  function scoreDoc(doc, terms) {
    const nt = doc.norm;
    let score = 0;
    let firstPos = Infinity;
    for (const t of terms) {
      const idx = nt.indexOf(t);
      if (idx === -1) return -1;
      score += 20;
      if (idx < firstPos) firstPos = idx;
      if (idx === 0) score += 18;
      else if (idx > 0 && /[^\p{L}\p{N}]/u.test(nt[idx - 1])) score += 9;
      // longer match vs. doc length: reward concentrated hits
      score += Math.min(10, Math.floor((t.length / Math.max(nt.length, 1)) * 200));
    }
    if (doc.type === 'title') score += 400;
    else if (doc.type === 'h4') score += 160;
    // shorter chunk = more focused
    score -= Math.min(24, Math.floor(nt.length / 240));
    return score;
  }

  function runSearch() {
    const q = queryTerm.trim();
    if (!q) {
      results = buildEmptyState();
      selectedIdx = results.length ? 0 : -1;
      renderResults();
      return;
    }
    if (!indexReady) {
      results = [];
      renderResults({ loading: true });
      return;
    }
    const terms = normalize(q).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      results = buildEmptyState();
      selectedIdx = 0;
      renderResults();
      return;
    }
    // Keep the single best chunk per (qnum, heading, type) so result list
    // doesn't drown in duplicate hits from the same paragraph.
    const best = new Map();
    for (const doc of docs) {
      const s = scoreDoc(doc, terms);
      if (s < 0) continue;
      const key = `${doc.qnum}:${doc.headingId}:${doc.type}`;
      const prev = best.get(key);
      if (!prev || s > prev.score) best.set(key, { doc, score: s });
    }
    const ranked = [...best.values()].sort((a, b) => b.score - a.score).slice(0, RESULTS_MAX);
    results = ranked.map(r => ({ kind: 'doc', doc: r.doc, score: r.score, terms, snippet: makeSnippet(r.doc, terms) }));
    const cmds = buildCommands().filter(c => matchCommand(c, terms)).slice(0, 5);
    if (cmds.length) results.push(...cmds.map(c => ({ kind: 'cmd', cmd: c })));
    selectedIdx = results.length ? 0 : -1;
    renderResults();
  }

  function buildEmptyState() {
    const api = window.StatnaSkuska;
    if (!api) return [];
    const recent = loadRecent().slice(0, RECENT_MAX).map(n => {
      const topic = api.examTopicForQnum(n);
      if (!topic) return null;
      const title = getQuestionTitle(n) || `Otázka ${n}`;
      return {
        kind: 'doc',
        group: 'Naposledy otvorené',
        doc: {
          type: 'title',
          topic,
          qnum: n,
          qtitle: title,
          h4: null,
          headingId: `q-${n}`,
          text: title,
          norm: normalize(title),
        },
        terms: [],
        snippet: null,
      };
    }).filter(Boolean);
    const cmds = buildCommands().map(c => ({ kind: 'cmd', cmd: c, group: 'Príkazy' }));
    return [...recent, ...cmds];
  }

  function getQuestionTitle(qnum) {
    if (!indexReady) return null;
    const d = docs.find(x => x.type === 'title' && x.qnum === qnum);
    return d ? d.text : null;
  }

  function makeSnippet(doc, terms) {
    if (doc.type !== 'body') return null;
    const nt = doc.norm;
    let first = Infinity;
    for (const t of terms) {
      const i = nt.indexOf(t);
      if (i >= 0 && i < first) first = i;
    }
    if (first === Infinity) return truncate(doc.text, 140);
    const W = 140;
    const start = Math.max(0, first - 32);
    const end = Math.min(doc.text.length, start + W);
    let snippet = doc.text.slice(start, end);
    if (start > 0) snippet = '…' + snippet;
    if (end < doc.text.length) snippet = snippet + '…';
    return snippet;
  }

  function highlight(text, terms) {
    if (!terms || !terms.length) return escHtml(text);
    const norm = normalize(text);
    const hits = [];
    for (const t of terms) {
      let from = 0;
      while (true) {
        const i = norm.indexOf(t, from);
        if (i === -1) break;
        hits.push([i, i + t.length]);
        from = i + t.length;
      }
    }
    if (!hits.length) return escHtml(text);
    hits.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [a, b] of hits) {
      if (merged.length && a <= merged[merged.length - 1][1]) {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], b);
      } else {
        merged.push([a, b]);
      }
    }
    let out = '';
    let cursor = 0;
    for (const [a, b] of merged) {
      out += escHtml(text.slice(cursor, a));
      out += '<mark>' + escHtml(text.slice(a, b)) + '</mark>';
      cursor = b;
    }
    out += escHtml(text.slice(cursor));
    return out;
  }

  // ---------- commands ----------
  function buildCommands() {
    const api = window.StatnaSkuska;
    if (!api) return [];
    return [
      {
        id: 'random',
        label: 'Skúšanie – náhodná otázka',
        sub: 'Otvoriť režim skúšania',
        norm: 'skusanie nahodna otazka random practice kocka roll',
        run: () => {
          const n = api.pickRandomQnum();
          api.navigateToRoute({ topic: api.examTopicForQnum(n), qnum: n, viewMode: 'focus', hash: '', mode: 'practice' });
        },
      },
      {
        id: 'theme',
        label: 'Prepnúť tému (svetlá/tmavá)',
        sub: 'Toggle light / dark',
        norm: 'prepnut temu theme dark light tma svetlo',
        run: () => document.getElementById('theme-toggle') && document.getElementById('theme-toggle').click(),
      },
      {
        id: 'progress-reset',
        label: 'Resetovať pokrok',
        sub: 'Vymazať stav všetkých otázok',
        norm: 'reset pokrok progres vymazat zmazat clear',
        run: () => {
          if (confirm('Naozaj resetovať pokrok všetkých otázok?')) {
            window.StatnaSkuska && window.StatnaSkuska.progress && window.StatnaSkuska.progress.clearAll();
          }
        },
      },
    ];
  }

  function matchCommand(cmd, terms) {
    const hay = cmd.norm + ' ' + normalize(cmd.label);
    return terms.every(t => hay.includes(t));
  }

  // ---------- UI ----------
  let rootEl, backdropEl, inputEl, listEl, statusEl;
  let isOpen = false;
  let queryTerm = '';
  let results = [];
  let selectedIdx = -1;

  function mount() {
    rootEl = document.createElement('div');
    rootEl.className = 'palette';
    rootEl.hidden = true;
    rootEl.innerHTML =
      '<div class="palette-backdrop" data-palette-dismiss="1"></div>' +
      '<div class="palette-modal">' +
        '<div class="palette-header">' +
          '<svg class="palette-header-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="11" cy="11" r="7"/>' +
            '<line x1="16.5" y1="16.5" x2="21" y2="21"/>' +
          '</svg>' +
          '<input type="text" class="palette-input" placeholder="Hľadaj otázku, pojem alebo príkaz…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />' +
          '<kbd class="palette-header-kbd">ESC</kbd>' +
        '</div>' +
        '<div class="palette-status" hidden></div>' +
        '<div class="palette-results"></div>' +
        '<div class="palette-footer">' +
          '<span class="palette-hint"><kbd>↑</kbd><kbd>↓</kbd> pohyb</span>' +
          '<span class="palette-hint"><kbd>↵</kbd> otvoriť</span>' +
          '<span class="palette-hint palette-hint-push"><kbd>⌘</kbd><kbd>K</kbd> otvor</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(rootEl);
    backdropEl = rootEl.querySelector('.palette-backdrop');
    inputEl = rootEl.querySelector('.palette-input');
    listEl = rootEl.querySelector('.palette-results');
    statusEl = rootEl.querySelector('.palette-status');

    inputEl.addEventListener('input', () => { queryTerm = inputEl.value; runSearch(); });
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
      else if (e.key === 'Home') { e.preventDefault(); selectIdx(0); }
      else if (e.key === 'End') { e.preventDefault(); selectIdx(results.length - 1); }
      else if (e.key === 'PageDown') { e.preventDefault(); moveSel(5); }
      else if (e.key === 'PageUp') { e.preventDefault(); moveSel(-5); }
      else if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });

    rootEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-palette-dismiss]')) { close(); return; }
      const row = e.target.closest('.palette-row');
      if (row) {
        const idx = Number(row.dataset.idx);
        if (!Number.isNaN(idx)) { selectedIdx = idx; commit(); }
      }
    });

    rootEl.addEventListener('mousemove', (e) => {
      const row = e.target.closest('.palette-row');
      if (!row) return;
      const idx = Number(row.dataset.idx);
      if (!Number.isNaN(idx) && idx !== selectedIdx) selectIdx(idx, { scroll: false });
    });
  }

  function moveSel(delta) {
    if (!results.length) return;
    selectIdx(Math.max(0, Math.min(results.length - 1, (selectedIdx < 0 ? 0 : selectedIdx) + delta)));
  }
  function selectIdx(i, opts) {
    selectedIdx = i;
    if (!listEl) return;
    Array.from(listEl.querySelectorAll('.palette-row')).forEach((el, j) => {
      const isSel = Number(el.dataset.idx) === i;
      el.classList.toggle('is-selected', isSel);
    });
    if (!opts || opts.scroll !== false) {
      const sel = listEl.querySelector(`.palette-row[data-idx="${i}"]`);
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
  }

  function renderResults(opts) {
    opts = opts || {};
    if (opts.loading) {
      statusEl.hidden = false;
      statusEl.textContent = 'Indexujem obsah…';
      listEl.innerHTML = '';
      return;
    }
    if (!results.length) {
      statusEl.hidden = false;
      statusEl.textContent = queryTerm ? 'Žiadne výsledky' : 'Začni písať alebo vyber z návrhov';
      listEl.innerHTML = '';
      return;
    }
    statusEl.hidden = true;

    let lastGroup = '';
    const html = [];
    results.forEach((r, i) => {
      const group = r.group || (r.kind === 'cmd' ? 'Príkazy' : 'Otázky a odpovede');
      if (group !== lastGroup) {
        html.push('<div class="palette-group">' + escHtml(group) + '</div>');
        lastGroup = group;
      }
      html.push(renderRow(r, i));
    });
    listEl.innerHTML = html.join('');
    if (selectedIdx >= results.length) selectedIdx = results.length - 1;
    if (selectedIdx < 0) selectedIdx = 0;
    selectIdx(selectedIdx);
  }

  function renderRow(r, i) {
    if (r.kind === 'cmd') {
      const c = r.cmd;
      return (
        '<div class="palette-row palette-row-cmd" data-idx="' + i + '">' +
          '<div class="palette-row-icon palette-row-icon-cmd">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>' +
          '</div>' +
          '<div class="palette-row-body">' +
            '<div class="palette-row-title">' + escHtml(c.label) + '</div>' +
            '<div class="palette-row-sub">' + escHtml(c.sub) + '</div>' +
          '</div>' +
        '</div>'
      );
    }
    const d = r.doc;
    const terms = r.terms || [];
    const num = String(d.qnum).padStart(2, '0');
    let titleHtml, subHtml, pill;
    if (d.type === 'title') {
      const short = d.qtitle.split(/[.!?]/)[0];
      titleHtml = highlight(short, terms);
      subHtml = escHtml(d.topic.title);
      pill = 'Otázka';
    } else if (d.type === 'h4') {
      titleHtml = highlight(d.h4, terms);
      const parent = d.qtitle.split(/[.!?]/)[0];
      subHtml = escHtml(d.topic.title) + ' · ' + escHtml(truncate(parent, 60));
      pill = 'Sekcia';
    } else {
      titleHtml = highlight(r.snippet || truncate(d.text, 140), terms);
      const parent = d.h4 || d.qtitle.split(/[.!?]/)[0];
      subHtml = escHtml(d.topic.title) + ' · ' + escHtml(truncate(parent, 60));
      pill = 'Text';
    }
    return (
      '<div class="palette-row palette-row-doc" data-idx="' + i + '">' +
        '<div class="palette-row-num">' + num + '</div>' +
        '<div class="palette-row-body">' +
          '<div class="palette-row-title">' + titleHtml + '</div>' +
          '<div class="palette-row-sub">' + subHtml + '</div>' +
        '</div>' +
        '<div class="palette-row-type-pill">' + escHtml(pill) + '</div>' +
      '</div>'
    );
  }

  function commit() {
    const r = results[selectedIdx];
    if (!r) return;
    if (r.kind === 'cmd') {
      close();
      setTimeout(() => r.cmd.run(), 0);
      return;
    }
    const d = r.doc;
    pushRecent(d.qnum);
    close();
    const api = window.StatnaSkuska;
    if (!api) return;
    const hash = d.headingId && d.headingId !== `q-${d.qnum}` ? '#' + d.headingId : '';
    api.navigateToRoute({ topic: d.topic, qnum: d.qnum, viewMode: 'focus', hash });
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    rootEl.hidden = false;
    document.body.classList.add('palette-open');
    inputEl.value = queryTerm;
    runSearch();
    requestAnimationFrame(() => {
      inputEl.focus();
      inputEl.select();
    });
    if (!indexReady) buildIndex();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    rootEl.hidden = true;
    document.body.classList.remove('palette-open');
  }

  function toggle() { if (isOpen) close(); else open(); }

  // ---------- init ----------
  function init() {
    mount();

    document.addEventListener('keydown', (e) => {
      const mod = (e.metaKey || e.ctrlKey) && !e.altKey;
      if (mod && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggle();
        return;
      }
    }, true);

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => buildIndex(), { timeout: 2500 });
    } else {
      setTimeout(() => buildIndex(), 800);
    }

    document.addEventListener('statna-skuska:route-changed', (e) => {
      const r = e.detail && e.detail.route;
      if (r && r.qnum) pushRecent(r.qnum);
    });

    window.StatnaSkuska = Object.assign(window.StatnaSkuska || {}, {
      palette: { open, close, toggle },
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
