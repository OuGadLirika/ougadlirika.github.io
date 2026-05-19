/* ------------------------------------------------------------------
   Study layer — progress tracking, utility dock, and
   self-graded practice mode. Designed to sit on top of the main app's
   router without taking ownership of rendering the markdown itself.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  const STORAGE_KEY = 'statna-skuska:progress:v1';
  const STATUS_ORDER = ['know', 'unknown'];
  const STATUS_META = {
    know: { label: 'OK' },
    unknown: { label: 'KO' },
  };
  const DICE_SVG =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="3" y="3" width="18" height="18" rx="3.5" ry="3.5"/>' +
      '<circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/>' +
      '<circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none"/>' +
      '<circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>' +
      '<circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none"/>' +
      '<circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none"/>' +
    '</svg>';
  let progressState = loadProgress();
  let dockEl = null;
  let questionCatalog = null;
  let questionCatalogPromise = null;

  function escHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
    ));
  }

  function cleanInlineMarkdown(value) {
    return String(value || '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function shortQuestionTitle(value, max = 74) {
    const clean = cleanInlineMarkdown(value);
    if (clean.length <= max) return clean;
    return clean.slice(0, max - 1).trimEnd() + '…';
  }

  function buildFallbackQuestionCatalog() {
    const api = getApi();
    const byQnum = new Map();
    const byTopic = new Map();
    if (!api || !Array.isArray(api.EXAM_TOPICS)) return { byQnum, byTopic };

    api.EXAM_TOPICS.forEach((topic) => {
      const items = [];
      for (let qnum = topic.qLo; qnum <= topic.qHi; qnum += 1) {
        const title = 'Otázka ' + String(qnum).padStart(2, '0');
        const entry = {
          qnum,
          title,
          shortTitle: title,
          topicSlug: topic.slug,
        };
        byQnum.set(qnum, entry);
        items.push(entry);
      }
      byTopic.set(topic.slug, items);
    });

    return { byQnum, byTopic };
  }

  function parseQuestionCatalogFromMarkdown(md, topic) {
    const entries = [];
    String(md || '').split('\n').forEach((line) => {
      const match = line.trim().match(/^###\s+(\d+)\.\s+(.+)$/);
      if (!match) return;
      const qnum = Number(match[1]);
      const title = cleanInlineMarkdown(match[2]);
      entries.push({
        qnum,
        title,
        shortTitle: shortQuestionTitle(title),
        topicSlug: topic.slug,
      });
    });
    return entries;
  }

  async function ensureQuestionCatalog() {
    if (questionCatalog) return questionCatalog;
    if (questionCatalogPromise) return questionCatalogPromise;

    const fallback = buildFallbackQuestionCatalog();
    const api = getApi();
    if (!api || !Array.isArray(api.EXAM_TOPICS)) {
      questionCatalog = fallback;
      return questionCatalog;
    }

    questionCatalogPromise = Promise.all(
      api.EXAM_TOPICS.map(async (topic) => {
        try {
          const md = await api.getMarkdown(topic.slug);
          return parseQuestionCatalogFromMarkdown(md, topic);
        } catch (_) {
          return [];
        }
      })
    ).then((groups) => {
      const byQnum = new Map(fallback.byQnum);
      const byTopic = new Map(fallback.byTopic);

      groups.forEach((entries, index) => {
        const topic = api.EXAM_TOPICS[index];
        if (!entries.length) return;
        byTopic.set(topic.slug, entries);
        entries.forEach((entry) => byQnum.set(entry.qnum, entry));
      });

      questionCatalog = { byQnum, byTopic };
      questionCatalogPromise = null;
      return questionCatalog;
    }).catch(() => {
      questionCatalog = fallback;
      questionCatalogPromise = null;
      return questionCatalog;
    });

    return questionCatalogPromise;
  }

  function loadProgress() {
    try {
      return sanitizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch (_) {
      return {};
    }
  }

  function sanitizeProgress(raw) {
    const clean = {};
    Object.keys(raw || {}).forEach((key) => {
      const qnum = Number(key);
      const status = raw[key];
      if (Number.isInteger(qnum) && qnum > 0 && status === 'know') {
        clean[qnum] = status;
      }
    });
    return clean;
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState));
    } catch (_) {}
  }

  function getApi() {
    return window.StatnaSkuska || null;
  }

  function commissionMarkerForTopic(topic) {
    const api = getApi();
    if (api && typeof api.commissionMarkerForTopic === 'function') {
      return api.commissionMarkerForTopic(topic);
    }
    const markers = api && api.COMMISSION_TOPIC_MARKERS ? api.COMMISSION_TOPIC_MARKERS : {
      'operacne-systemy': 'Hosťovecký',
      'grafika': 'Beňo · Hosťovecký',
      'algoritmy': 'Pospíchal',
    };
    return topic && markers[topic.slug] ? markers[topic.slug] : '';
  }

  function getTotalQuestionCount() {
    const api = getApi();
    if (!api || !Array.isArray(api.EXAM_TOPICS) || !api.EXAM_TOPICS.length) return 0;
    return api.EXAM_TOPICS[api.EXAM_TOPICS.length - 1].qHi;
  }

  function getStatus(qnum) {
    if (!qnum) return null;
    return progressState[qnum] === 'know' ? 'know' : 'unknown';
  }

  function setStatus(qnum, status) {
    if (!qnum || !STATUS_META[status]) return;
    if (status === 'unknown') {
      delete progressState[qnum];
    } else if (progressState[qnum] === status) {
      delete progressState[qnum];
    } else {
      progressState[qnum] = status;
    }
    saveProgress();
    renderStudyUi();
    document.dispatchEvent(new CustomEvent('statna-skuska:progress-changed', {
      detail: { qnum, status: getStatus(qnum) },
    }));
  }

  function clearAll() {
    progressState = {};
    saveProgress();
    renderStudyUi();
    document.dispatchEvent(new CustomEvent('statna-skuska:progress-changed', {
      detail: { qnum: null, status: null },
    }));
  }

  function getCountsForRange(qLo, qHi) {
    const counts = {
      know: 0,
      total: Math.max(0, qHi - qLo + 1),
    };
    for (let qnum = qLo; qnum <= qHi; qnum += 1) {
      if (progressState[qnum] === 'know') counts.know += 1;
    }
    counts.unknown = Math.max(0, counts.total - counts.know);
    return counts;
  }

  function getCounts() {
    return getCountsForRange(1, getTotalQuestionCount());
  }

  function koRiskPercent(counts) {
    if (!counts || !counts.total) return 0;
    return Math.max(0, Math.min(100, Math.round((counts.unknown / counts.total) * 100)));
  }

  function statusPlainLabel(status) {
    return STATUS_META[status] ? STATUS_META[status].label : '';
  }

  function statusLabelHtml(status) {
    if (status === 'know') {
      return '<span class="study-ok-label" title="' + escHtml(statusPlainLabel(status)) + '">OK</span>';
    }
    if (status === 'unknown') {
      return '<span class="study-ko-label" title="' + escHtml(statusPlainLabel(status)) + '">KO</span>';
    }
    return escHtml(statusPlainLabel(status));
  }

  function statusCountText(status, count) {
    return statusPlainLabel(status) + ' ' + count;
  }

  function dashboardTitleForQuestion(qnum, catalog) {
    const entry = catalog && catalog.byQnum ? catalog.byQnum.get(qnum) : null;
    if (!entry) return 'Otázka ' + String(qnum).padStart(2, '0');
    return entry.title || ('Otázka ' + String(qnum).padStart(2, '0'));
  }

  function buildTopicDashboardData(route, catalog) {
    const api = getApi();
    if (!api || !Array.isArray(api.EXAM_TOPICS)) return [];

    return api.EXAM_TOPICS.map((topic) => {
      const counts = getCountsForRange(topic.qLo, topic.qHi);
      const risk = koRiskPercent(counts);
      const current = !!(route && route.topic && route.topic.slug === topic.slug);
      const questions = [];

      for (let qnum = topic.qLo; qnum <= topic.qHi; qnum += 1) {
        const title = dashboardTitleForQuestion(qnum, catalog);
        questions.push({
          qnum,
          title,
          shortTitle: shortQuestionTitle(title, 66),
          status: getStatus(qnum),
        });
      }

      return {
        topic,
        counts,
        risk,
        current,
        questions,
      };
    });
  }

  const TOPIC_BLURBS = {
    'operacne-systemy':         'typy OS · pamäť · súborové systémy · procesy a vlákna',
    'architektury':             'informácia a sústavy · generácie a paralelizmus · mikroprocesor · inštrukcie a výkon',
    'databazy':                 'princípy DBS · dátové modely a ERD · SQL/PLSQL · databázová architektúra',
    'internet':                 'HTML základy · multimédiá v HTML · CSS · PHP',
    'grafika':                  'vektor a raster · 2D transformácie · farby · zariadenia · VR/AR a MOCAP',
    'algoritmy':                'algoritmy a paradigmy · ADT · OOP · triedenia',
    'softverove-inzinierstvo':  'informačné systémy · kvalita softvéru · procesy vývoja · UML',
    'matematika':               'logika · regulárne jazyky · bezkontextové jazyky · Turingov stroj · zložitosť',
    'siete':                    'sieťové modely · komponenty sietí · IPv4 a smerovanie · kryptografia · bezpečnostná politika',
  };

  function slovakQuestionWord(n) {
    if (n === 1) return 'otázka';
    if (n >= 2 && n <= 4) return 'otázky';
    return 'otázok';
  }

  function renderEditorialDashboardHtml({ route, counts, risk, topics }) {
    const total = counts.total || 39;
    const api = getApi();
    const practiceHref = api && api.routeHrefFor
      ? api.routeHrefFor(null, { mode: 'practice' })
      : (location.pathname + '?mode=practice');
    const okPercent = total ? Math.round((counts.know / total) * 100) : 0;

    const rows = topics.map((entry, i) => {
      const topic = entry.topic;
      const count = entry.counts.total;
      const href = api && api.routeHrefFor
        ? api.routeHrefFor(topic, { qnum: topic.qLo })
        : (location.pathname + '?topic=' + encodeURIComponent(topic.slug) + '&q=' + topic.qLo);
      const blurb = TOPIC_BLURBS[topic.slug] || '';
      const marker = commissionMarkerForTopic(topic);
      const winCount = entry.counts.know;
      const koCount = entry.counts.unknown;
      const progressBits =
        '<span class="dash-row__meter">' +
          '<span class="dash-row__meter-fill dash-row__meter-fill--win" style="flex:' + winCount + '"></span>' +
          '<span class="dash-row__meter-fill dash-row__meter-fill--ko" style="flex:' + koCount + '"></span>' +
        '</span>';
      const progressLabels =
        '<span class="dash-row__tally">' +
          '<span class="dash-row__tally-win">' + winCount + ' OK</span>' +
          '<span class="dash-row__tally-ko">' + koCount + ' KO</span>' +
        '</span>';

      return (
        '<a class="dash-row' + (marker ? ' dash-row--commission' : '') + '" href="' + escHtml(href) + '"' +
          ' data-route-topic="' + escHtml(topic.slug) + '"' +
          ' data-route-q="' + escHtml(String(topic.qLo)) + '"' +
          ' style="--dash-row-delay:' + (i * 35) + 'ms">' +
          '<span class="dash-row__num">' + escHtml(topic.num) + '</span>' +
          '<span class="dash-row__body">' +
            '<span class="dash-row__title">' + escHtml(topic.title) + '</span>' +
            (marker ? '<span class="dash-row__marker">Komisia · ' + escHtml(marker) + '</span>' : '') +
            '<span class="dash-row__blurb">' + escHtml(blurb) + '</span>' +
            progressBits +
          '</span>' +
          '<span class="dash-row__count">' +
            progressLabels +
            '<span class="dash-row__count-num">' + count + '</span>' +
            '<span class="dash-row__count-word">' + slovakQuestionWord(count) + '</span>' +
          '</span>' +
          '<span class="dash-row__chev">→</span>' +
        '</a>'
      );
    }).join('');

    return (
      '<section class="dash">' +
        '<header class="dash__head">' +
          '<div class="dash__progress">' +
            '<div class="dash__progress-track">' +
              '<span class="dash__progress-fill dash__progress-fill--ok" style="flex:' + counts.know + '"></span>' +
              '<span class="dash__progress-fill dash__progress-fill--ko" style="flex:' + counts.unknown + '"></span>' +
            '</div>' +
            '<div class="dash__progress-meta">' +
              '<span class="dash__progress-chip dash__progress-chip--ok">OK ' + counts.know + '</span>' +
              '<span class="dash__progress-chip dash__progress-chip--ko">KO ' + counts.unknown + '</span>' +
              '<span class="dash__progress-chip dash__progress-chip--neutral">' + okPercent + '% OK</span>' +
            '</div>' +
          '</div>' +
        '</header>' +

        '<a class="dash__cta" href="' + escHtml(practiceHref) + '" data-route-mode="practice">' +
	          '<span class="dash__cta-eyebrow">Skúšanie</span>' +
	          '<span class="dash__cta-title">Náhodná otázka<span class="dash__cta-arrow">→</span></span>' +
	        '</a>' +

	        '<nav class="dash__index">' +
	          '<div class="dash__rows">' + rows + '</div>' +
	        '</nav>' +
      '</section>'
    );
  }

  function getActiveRoute() {
    const api = getApi();
    return api && api.getActiveRoute ? api.getActiveRoute() : null;
  }

  function isDashboardHomeRoute(route) {
    return !!(route && route.mode === 'home');
  }

  function getKeyboardTargetQnum() {
    const route = getActiveRoute();
    if (route && route.qnum) return route.qnum;

    const sections = Array.from(document.querySelectorAll('.prose .question h3[data-qnum]'));
    if (!sections.length) return null;

    const threshold = (window.scrollY || window.pageYOffset || 0) + 160;
    let current = sections[0];
    sections.forEach((heading) => {
      if (heading.offsetTop <= threshold) current = heading;
    });
    return Number(current.dataset.qnum) || null;
  }

  function getQuestionNumberForLink(link) {
    const direct = Number(link.dataset.routeQ || '');
    if (Number.isInteger(direct) && direct > 0) return direct;
    const targetId = link.dataset.targetId || '';
    const match = targetId.match(/^q-(\d+)/);
    return match ? Number(match[1]) : null;
  }

  function statusButtonsHtml(qnum, { groupClass } = {}) {
    const current = getStatus(qnum);
    const buttons = STATUS_ORDER.map((status) => {
      const active = current === status;
      return (
        '<button type="button" class="study-progress-btn' + (active ? ' is-active' : '') + '" data-progress-q="' + qnum + '" data-progress-set="' + status + '" title="' + escHtml(statusPlainLabel(status)) + '">' +
          '<span class="study-progress-btn__label is-icon">' + statusLabelHtml(status) + '</span>' +
        '</button>'
      );
    }).join('');

    return '<div class="' + (groupClass || 'study-progress__buttons') + '">' + buttons + '</div>';
  }

  function mountUtilityDock() {
    if (dockEl) return;

    dockEl = document.createElement('div');
    dockEl.className = 'utility-dock';

    const searchBtn = document.createElement('button');
    searchBtn.type = 'button';
    searchBtn.className = 'search-toggle';
    searchBtn.innerHTML =
      '<svg class="search-toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="11" cy="11" r="7"/>' +
        '<line x1="16.5" y1="16.5" x2="21" y2="21"/>' +
      '</svg>' +
      '<span class="search-toggle-label">Hľadať</span>' +
      '<span class="search-toggle-kbd"><kbd>⌘</kbd><kbd>K</kbd></span>';
    searchBtn.addEventListener('click', () => {
      const api = getApi();
      if (api && api.palette && api.palette.open) api.palette.open();
    });
    dockEl.appendChild(searchBtn);

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) dockEl.appendChild(themeBtn);

    document.body.appendChild(dockEl);
  }

  function renderQuestionControls() {
    document.querySelectorAll('.prose .question').forEach((section) => {
      const heading = section.querySelector('.q-head h3[data-qnum]');
      if (!heading) return;

      const qnum = Number(heading.dataset.qnum);
      const status = getStatus(qnum);
      section.dataset.progress = status;

      const existing = section.querySelector('.study-progress');
      if (existing) existing.remove();
    });
  }

  function renderContentSummary() {
    const prose = document.getElementById('prose');
    const route = getActiveRoute();

    if (!prose) return;

    if (!isDashboardHomeRoute(route)) {
      if (prose.dataset.view === 'home') {
        prose.innerHTML = '';
      }
      return;
    }

    if (!questionCatalog && !questionCatalogPromise) {
      ensureQuestionCatalog().then(() => renderStudyUi());
    }

    const catalog = questionCatalog || buildFallbackQuestionCatalog();
    const counts = getCounts();
    const risk = koRiskPercent(counts);
    const topics = buildTopicDashboardData(route, catalog);

    prose.dataset.view = 'home';
    prose.innerHTML = renderEditorialDashboardHtml({ route, counts, risk, topics });
  }

  function revealPracticeAnswer() {
    const body = document.querySelector('.prose .question .q-body');
    if (!body || !body.hidden) return;

    body.hidden = false;
    body.dataset.practiceAnswer = 'revealed';
    const question = body.closest('.question');
    if (question) question.classList.add('practice-answer-revealed');

    renderPracticePanel();

    const target = body.querySelector('blockquote, h4, p, ul, ol, pre, .visualizer-block') || body;
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start' });
    });
  }

  function rollPracticeQuestion() {
    const api = getApi();
    const route = getActiveRoute();
    if (!api || !api.pickRandomQnum || !api.navigateToRoute || !api.examTopicForQnum) return;

    const next = api.pickRandomQnum(route && route.qnum ? route.qnum : null);
    api.navigateToRoute({
      topic: api.examTopicForQnum(next),
      qnum: next,
      viewMode: 'focus',
      hash: '',
      mode: 'practice',
    });
  }

  function renderPracticePanel() {
    document.querySelectorAll('.practice-panel').forEach((panel) => panel.remove());

    const route = getActiveRoute();
    const question = document.querySelector('.prose .question');
    const body = question ? question.querySelector('.q-body') : null;
    const revealed = !!(body && !body.hidden);

    document.body.classList.toggle('practice-answer-revealed', revealed);

    if (!route || route.mode !== 'practice' || !route.qnum || !question) return;

    const current = getStatus(route.qnum);
    const panel = document.createElement('section');
    panel.className = 'practice-panel' + (revealed ? ' is-revealed' : '');
    panel.dataset.qnum = String(route.qnum);
    panel.innerHTML =
      '<div class="practice-panel__actions">' +
        '<button type="button" class="practice-panel__button practice-panel__button--reveal"' + (revealed ? ' disabled' : '') + '>Zobraziť odpoveď</button>' +
        '<button type="button" class="practice-panel__button practice-panel__button--next">' + DICE_SVG + '<span>Ďalšia otázka</span></button>' +
      '</div>' +
      '<div class="practice-panel__grading"' + (revealed ? '' : ' hidden') + '>' +
        statusButtonsHtml(route.qnum, { groupClass: 'practice-panel__grade-buttons' }) +
      '</div>';

    question.insertAdjacentElement('afterend', panel);
  }

  function renderStudyUi() {
    renderQuestionControls();
    renderContentSummary();
    renderPracticePanel();
  }

  function handleDocumentClick(event) {
    const progressBtn = event.target.closest('[data-progress-q][data-progress-set]');
    if (progressBtn) {
      const qnum = Number(progressBtn.dataset.progressQ);
      const status = progressBtn.dataset.progressSet;
      if (Number.isInteger(qnum) && STATUS_META[status]) setStatus(qnum, status);
      return;
    }

    const questionTarget = event.target.closest('[data-dashboard-qnum]');
    if (questionTarget) {
      const qnum = Number(questionTarget.dataset.dashboardQnum);
      const api = getApi();
      if (api && Number.isInteger(qnum) && qnum > 0 && api.examTopicForQnum && api.navigateToRoute) {
        api.navigateToRoute({
          topic: api.examTopicForQnum(qnum),
          qnum,
          viewMode: 'focus',
          hash: '',
        });
      }
      return;
    }

    const topicTarget = event.target.closest('[data-dashboard-topic]');
    if (topicTarget) {
      const slug = topicTarget.dataset.dashboardTopic;
      const api = getApi();
      const topic = api && Array.isArray(api.EXAM_TOPICS)
        ? api.EXAM_TOPICS.find((candidate) => candidate.slug === slug)
        : null;
      if (api && topic && api.navigateToRoute) {
        api.navigateToRoute({
          topic,
          qnum: topic.qLo,
          viewMode: 'focus',
          hash: '',
        });
      }
      return;
    }

    if (event.target.closest('.practice-panel__button--reveal')) {
      revealPracticeAnswer();
      return;
    }

    if (event.target.closest('.practice-panel__button--next')) {
      rollPracticeQuestion();
      return;
    }

    if (event.target.closest('[data-dashboard-action="clear"]')) {
      clearAll();
    }
  }

  function exposeApi() {
    window.StatnaSkuska = Object.assign(window.StatnaSkuska || {}, {
      progress: {
        getAll() {
          return { ...progressState };
        },
        getStatus,
        setStatus,
        clearAll,
        getCounts,
      },
    });
  }

  function init() {
    mountUtilityDock();
    exposeApi();
    renderStudyUi();

    const warmCatalog = () => {
      ensureQuestionCatalog().then(() => renderStudyUi());
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(warmCatalog, { timeout: 1800 });
    } else {
      window.setTimeout(warmCatalog, 240);
    }

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('statna-skuska:route-changed', renderStudyUi);
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      progressState = loadProgress();
      renderStudyUi();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
