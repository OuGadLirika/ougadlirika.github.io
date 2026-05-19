class DfaVisualizer {
  constructor(container) {
    this.container = container;
    this.initDOM();
    
    this.machines = {
      ending1: {
        id: 'ending1',
        title: 'Končí na 1',
        subtitle: 'L = { w | w končí na 1 }',
        description: 'Automat si pamätá, či posledný prečítaný znak bol 1.',
        initialState: 'q0',
        states: {
          'q0': { x: 120, y: 100, label: 'q0', accept: false },
          'q1': { x: 280, y: 100, label: 'q1', accept: true }
        },
        edges: [
          { id: 'e1', from: 'q0', to: 'q0', char: '0', path: 'M 110 122 C 90 180, 150 180, 130 122', lx: 120, ly: 165 },
          { id: 'e2', from: 'q0', to: 'q1', char: '1', path: 'M 145 105 Q 200 140 255 105', lx: 200, ly: 135 },
          { id: 'e3', from: 'q1', to: 'q0', char: '0', path: 'M 268 85 Q 200 40 132 85', lx: 200, ly: 55 },
          { id: 'e4', from: 'q1', to: 'q1', char: '1', path: 'M 270 122 C 250 180, 310 180, 290 122', lx: 280, ly: 165 }
        ],
        transitions: {
          'q0': { '0': { next: 'q0', edgeId: 'e1' }, '1': { next: 'q1', edgeId: 'e2' } },
          'q1': { '0': { next: 'q0', edgeId: 'e3' }, '1': { next: 'q1', edgeId: 'e4' } }
        },
        defaultInput: '1011'
      },
      even1s: {
        id: 'even1s',
        title: 'Párny počet 1',
        subtitle: 'L = { w | w obsahuje párny počet jednotiek }',
        description: 'Stav reprezentuje paritu počtu doteraz prečítaných jednotiek.',
        initialState: 'even',
        states: {
          'even': { x: 120, y: 100, label: 'párny', accept: true },
          'odd':  { x: 280, y: 100, label: 'nepárny', accept: false }
        },
        edges: [
          { id: 'e1', from: 'even', to: 'even', char: '0', path: 'M 110 122 C 90 180, 150 180, 130 122', lx: 120, ly: 165 },
          { id: 'e2', from: 'even', to: 'odd',  char: '1', path: 'M 145 105 Q 200 140 255 105', lx: 200, ly: 135 },
          { id: 'e3', from: 'odd',  to: 'even', char: '1', path: 'M 268 85 Q 200 40 132 85', lx: 200, ly: 55 },
          { id: 'e4', from: 'odd',  to: 'odd',  char: '0', path: 'M 270 122 C 250 180, 310 180, 290 122', lx: 280, ly: 165 }
        ],
        transitions: {
          'even': { '0': { next: 'even', edgeId: 'e1' }, '1': { next: 'odd', edgeId: 'e2' } },
          'odd':  { '0': { next: 'odd', edgeId: 'e4' }, '1': { next: 'even', edgeId: 'e3' } }
        },
        defaultInput: '11011'
      }
    };
    
    this.currentMachineId = 'ending1';
    this.word = '';
    this.currentIndex = 0;
    this.currentState = null;
    this.activeEdgeId = null;
    this.isPlaying = false;
    this.playInterval = null;
    
    this.bindEvents();
    this.loadMachine(this.currentMachineId);
  }
  
  initDOM() {
    this.container.innerHTML = `
      <div class="dfa-container">
        <div class="dfa-header">
          <div class="dfa-title-block">
            <div class="dfa-title" id="dfa-title">Názov automatu</div>
            <div class="dfa-subtitle" id="dfa-subtitle">Popis</div>
          </div>
          <div class="dfa-controls-mode">
            <button class="dfa-btn-mode is-active" data-mode="ending1">Končí na 1</button>
            <button class="dfa-btn-mode" data-mode="even1s">Párny počet 1</button>
          </div>
        </div>
        <div class="dfa-stage">
          <div class="dfa-input-wrapper">
            <span class="dfa-input-label">Vstup (0 a 1):</span>
            <input type="text" class="dfa-input" value="1011" pattern="[01]*" maxlength="10">
          </div>
          <div class="dfa-tape" id="dfa-tape"></div>
          <div class="dfa-graph-container">
            <svg class="dfa-graph" viewBox="0 0 400 200">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" class="marker-path" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-active-dark" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
                </marker>
              </defs>
              <g id="dfa-edges"></g>
              <g id="dfa-nodes"></g>
            </svg>
          </div>
        </div>
        <div class="dfa-footer">
          <div class="dfa-log" id="dfa-log">Pripravené na spustenie.</div>
          <div class="dfa-actions">
            <button class="dfa-btn dfa-btn-step">Krok</button>
            <button class="dfa-btn dfa-btn-primary dfa-btn-play" title="Prehrať">
              ${DfaVisualizer.playIcon()}
            </button>
            <button class="dfa-btn dfa-btn-reset" title="Reset">
              <svg viewBox="0 0 24 24">
                <path d="M20 6v5h-5"/>
                <path d="M4 18v-5h5"/>
                <path d="M18.2 9A7 7 0 0 0 6.8 6.8L4 9.5"/>
                <path d="M5.8 15A7 7 0 0 0 17.2 17.2L20 14.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.elTitle = this.container.querySelector('#dfa-title');
    this.elSubtitle = this.container.querySelector('#dfa-subtitle');
    this.elTape = this.container.querySelector('#dfa-tape');
    this.elInput = this.container.querySelector('.dfa-input');
    this.elLog = this.container.querySelector('#dfa-log');
    this.elNodes = this.container.querySelector('#dfa-nodes');
    this.elEdges = this.container.querySelector('#dfa-edges');
    
    this.btnReset = this.container.querySelector('.dfa-btn-reset');
    this.btnStep = this.container.querySelector('.dfa-btn-step');
    this.btnPlay = this.container.querySelector('.dfa-btn-play');
    this.btnModes = this.container.querySelectorAll('.dfa-btn-mode');
  }

  static playIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  }

  static pauseIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M8 5h3v14H8z"/><path d="M13 5h3v14h-3z"/></svg>`;
  }

  setPlayButton(isPlaying) {
    this.btnPlay.innerHTML = isPlaying ? DfaVisualizer.pauseIcon() : DfaVisualizer.playIcon();
    this.btnPlay.title = isPlaying ? 'Pauza' : 'Prehrať';
  }
  
  bindEvents() {
    this.btnModes.forEach(btn => {
      btn.addEventListener('click', () => {
        this.btnModes.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.loadMachine(btn.dataset.mode);
      });
    });
    
    this.elInput.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^01]/g, '');
      e.target.value = val;
      this.reset();
    });
    
    this.btnReset.addEventListener('click', () => this.reset());
    this.btnStep.addEventListener('click', () => this.step());
    this.btnPlay.addEventListener('click', () => this.togglePlay());
  }
  
  loadMachine(id) {
    this.currentMachineId = id;
    const m = this.machines[id];
    this.elTitle.textContent = m.title;
    this.elSubtitle.textContent = m.subtitle;
    this.elInput.value = m.defaultInput;
    this.renderSvg();
    this.reset();
  }
  
  renderSvg() {
    const m = this.machines[this.currentMachineId];
    
    // Initial arrow
    const startX = m.states[m.initialState].x - 50;
    const startY = m.states[m.initialState].y;
    let edgesHtml = `<path d="M ${startX} ${startY} L ${startX + 20} ${startY}" class="dfa-edge" />`;
    
    m.edges.forEach(e => {
      edgesHtml += `
        <g class="dfa-edge-group" id="edge-${e.id}">
          <path d="${e.path}" class="dfa-edge" id="path-${e.id}" />
          <circle cx="${e.lx}" cy="${e.ly}" r="10" class="dfa-edge-label-bg" />
          <text x="${e.lx}" y="${e.ly}" class="dfa-edge-label">${e.char}</text>
        </g>
      `;
    });
    this.elEdges.innerHTML = edgesHtml;
    
    let nodesHtml = '';
    for (const [sId, s] of Object.entries(m.states)) {
      nodesHtml += `
        <g class="dfa-node-group" id="node-${sId}">
          <circle cx="${s.x}" cy="${s.y}" r="25" class="dfa-node ${s.accept ? 'is-accept' : ''}" />
          ${s.accept ? `<circle cx="${s.x}" cy="${s.y}" r="20" class="dfa-node-inner" />` : ''}
          <text x="${s.x}" y="${s.y}" class="dfa-node-label">${s.label}</text>
        </g>
      `;
    }
    this.elNodes.innerHTML = nodesHtml;
  }
  
  reset() {
    this.pause();
    this.word = this.elInput.value;
    this.currentIndex = 0;
    const m = this.machines[this.currentMachineId];
    this.currentState = m.initialState;
    this.activeEdgeId = null;
    
    this.updateUI(`Pripravené. Počiatočný stav: ${m.states[this.currentState].label}`);
    this.elLog.className = 'dfa-log';
  }
  
  updateUI(logMsg) {
    // Update Tape
    let tapeHtml = '';
    for (let i = 0; i < this.word.length; i++) {
      let cls = 'dfa-tape-cell';
      if (i < this.currentIndex) cls += ' is-past';
      if (i === this.currentIndex) cls += ' is-active';
      tapeHtml += `<div class="${cls}">${this.word[i]}</div>`;
    }
    if (this.word.length === 0) tapeHtml = '<div class="dfa-tape-cell" style="opacity:0.3">ε</div>';
    this.elTape.innerHTML = tapeHtml;
    
    // Update Graph
    const m = this.machines[this.currentMachineId];
    for (const sId of Object.keys(m.states)) {
      const g = this.container.querySelector(`#node-${sId} .dfa-node`);
      if (g) {
        if (sId === this.currentState) g.classList.add('is-active');
        else g.classList.remove('is-active');
      }
    }
    
    m.edges.forEach(e => {
      const p = this.container.querySelector(`#path-${e.id}`);
      if (p) {
        if (e.id === this.activeEdgeId) p.classList.add('is-active');
        else p.classList.remove('is-active');
      }
    });
    
    // Buttons
    const isDone = this.currentIndex >= this.word.length && this.word.length > 0;
    this.btnStep.disabled = isDone || this.word.length === 0;
    
    if (isDone) {
      const accepted = m.states[this.currentState].accept;
      if (accepted) {
        this.elLog.textContent = 'Výpočet skončil. Slovo je AKCEPTOVANÉ.';
        this.elLog.className = 'dfa-log is-accept';
      } else {
        this.elLog.textContent = 'Výpočet skončil. Slovo je ZAMIETNUTÉ.';
        this.elLog.className = 'dfa-log is-reject';
      }
      this.btnPlay.disabled = true;
      this.setPlayButton(false);
    } else {
      if (logMsg) this.elLog.textContent = logMsg;
      this.btnPlay.disabled = this.word.length === 0;
    }
  }
  
  step() {
    if (this.currentIndex >= this.word.length) return;
    
    const char = this.word[this.currentIndex];
    const m = this.machines[this.currentMachineId];
    const stateDef = m.transitions[this.currentState];
    const trans = stateDef[char];
    
    const oldState = m.states[this.currentState].label;
    
    if (trans) {
      this.currentState = trans.next;
      this.activeEdgeId = trans.edgeId;
      const newState = m.states[this.currentState].label;
      this.currentIndex++;
      this.updateUI(`Čítam '${char}': prechod z ${oldState} do ${newState}`);
    } else {
      // In a complete DFA this shouldn't happen, but just in case
      this.pause();
      this.updateUI(`Chyba: Žiadny prechod pre '${char}' zo stavu ${oldState}`);
    }
  }
  
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentIndex >= this.word.length) this.reset();
      this.play();
    }
  }
  
  play() {
    this.isPlaying = true;
    this.setPlayButton(true);
    this.btnStep.disabled = true;
    this.elInput.disabled = true;
    
    this.playInterval = setInterval(() => {
      if (this.currentIndex >= this.word.length) {
        this.pause();
      } else {
        this.step();
      }
    }, 1000);
  }
  
  pause() {
    this.isPlaying = false;
    this.setPlayButton(false);
    this.btnStep.disabled = this.currentIndex >= this.word.length;
    this.elInput.disabled = false;
    clearInterval(this.playInterval);
  }
}

window.DfaVisualizer = DfaVisualizer;

class DeterministicDfaVisualizer {
  constructor(container) {
    this.container = container;
    this.states = {
      q0: { x: 90, y: 105, label: 'q0', note: 'zvyšok 0', accept: true },
      q1: { x: 250, y: 58, label: 'q1', note: 'zvyšok 1', accept: false },
      q2: { x: 250, y: 150, label: 'q2', note: 'zvyšok 2', accept: false }
    };
    this.edges = [
      { id: 'q0-0', from: 'q0', to: 'q0', char: '0', path: 'M 76 128 C 42 176, 138 176, 104 128', lx: 90, ly: 177 },
      { id: 'q0-1', from: 'q0', to: 'q1', char: '1', path: 'M 115 98 Q 160 54 225 60', lx: 162, ly: 60 },
      { id: 'q1-1', from: 'q1', to: 'q0', char: '1', path: 'M 229 73 Q 168 112 116 115', lx: 166, ly: 116 },
      { id: 'q1-0', from: 'q1', to: 'q2', char: '0', path: 'M 265 79 C 302 98, 302 111, 265 129', lx: 304, ly: 105 },
      { id: 'q2-0', from: 'q2', to: 'q1', char: '0', path: 'M 235 129 C 198 111, 198 98, 235 79', lx: 196, ly: 105 },
      { id: 'q2-1', from: 'q2', to: 'q2', char: '1', path: 'M 272 165 C 326 192, 326 108, 272 135', lx: 326, ly: 150 }
    ];
    this.transitions = {
      q0: { '0': { next: 'q0', edgeId: 'q0-0' }, '1': { next: 'q1', edgeId: 'q0-1' } },
      q1: { '0': { next: 'q2', edgeId: 'q1-0' }, '1': { next: 'q0', edgeId: 'q1-1' } },
      q2: { '0': { next: 'q1', edgeId: 'q2-0' }, '1': { next: 'q2', edgeId: 'q2-1' } }
    };
    this.word = '';
    this.currentIndex = 0;
    this.currentState = 'q0';
    this.currentValue = 0;
    this.activeEdgeId = null;
    this.activeCell = null;
    this.isPlaying = false;
    this.playInterval = null;
    this.initDOM();
    this.bindEvents();
    this.reset();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="dfa-container dfa-det-container">
        <div class="dfa-header">
          <div class="dfa-title-block">
            <div class="dfa-title">DFA: binárne číslo deliteľné 3</div>
            <div class="dfa-subtitle">Každý stav znamená aktuálny zvyšok po delení 3.</div>
          </div>
          <div class="dfa-det-badge">δ(stav, znak) → jeden stav</div>
        </div>
        <div class="dfa-det-layout">
          <div class="dfa-det-main">
            <div class="dfa-input-wrapper">
              <span class="dfa-input-label">Vstup (0 a 1):</span>
              <input type="text" class="dfa-input" value="110" pattern="[01]*" maxlength="12">
            </div>
            <div class="dfa-tape"></div>
            <div class="dfa-graph-container dfa-det-graph-wrap">
              <svg class="dfa-graph dfa-det-graph" viewBox="0 0 360 220">
                <defs>
                  <marker id="dfa-det-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                  </marker>
                  <marker id="dfa-det-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                  <marker id="dfa-det-arrow-active-dark" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
                  </marker>
                </defs>
                <g class="dfa-det-edges"></g>
                <g class="dfa-det-nodes"></g>
              </svg>
            </div>
          </div>
          <div class="dfa-det-side">
            <div class="dfa-det-memory">
              <span class="dfa-det-kicker">Pamäť automatu</span>
              <strong class="dfa-det-remainder">zvyšok 0</strong>
              <span class="dfa-det-value">hodnota prefixu: 0</span>
            </div>
            <table class="dfa-det-table">
              <thead>
                <tr><th>stav</th><th>0</th><th>1</th></tr>
              </thead>
              <tbody>
                <tr data-state="q0"><th>q0</th><td data-state="q0" data-char="0">q0</td><td data-state="q0" data-char="1">q1</td></tr>
                <tr data-state="q1"><th>q1</th><td data-state="q1" data-char="0">q2</td><td data-state="q1" data-char="1">q0</td></tr>
                <tr data-state="q2"><th>q2</th><td data-state="q2" data-char="0">q1</td><td data-state="q2" data-char="1">q2</td></tr>
              </tbody>
            </table>
            <div class="dfa-det-formula">nový zvyšok = (2 × starý zvyšok + bit) mod 3</div>
          </div>
        </div>
        <div class="dfa-footer">
          <div class="dfa-log">Pripravené.</div>
          <div class="dfa-actions">
            <button class="dfa-btn dfa-btn-step">Krok</button>
            <button class="dfa-btn dfa-btn-primary dfa-btn-play" title="Prehrať">
              ${DfaVisualizer.playIcon()}
            </button>
            <button class="dfa-btn dfa-btn-reset" title="Reset">
              <svg viewBox="0 0 24 24">
                <path d="M20 6v5h-5"/>
                <path d="M4 18v-5h5"/>
                <path d="M18.2 9A7 7 0 0 0 6.8 6.8L4 9.5"/>
                <path d="M5.8 15A7 7 0 0 0 17.2 17.2L20 14.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    this.elInput = this.container.querySelector('.dfa-input');
    this.elTape = this.container.querySelector('.dfa-tape');
    this.elLog = this.container.querySelector('.dfa-log');
    this.elNodes = this.container.querySelector('.dfa-det-nodes');
    this.elEdges = this.container.querySelector('.dfa-det-edges');
    this.elRemainder = this.container.querySelector('.dfa-det-remainder');
    this.elValue = this.container.querySelector('.dfa-det-value');
    this.btnStep = this.container.querySelector('.dfa-btn-step');
    this.btnPlay = this.container.querySelector('.dfa-btn-play');
    this.btnReset = this.container.querySelector('.dfa-btn-reset');

    this.renderSvg();
  }

  bindEvents() {
    this.elInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^01]/g, '');
      this.reset();
    });
    this.btnStep.addEventListener('click', () => this.step());
    this.btnPlay.addEventListener('click', () => this.togglePlay());
    this.btnReset.addEventListener('click', () => this.reset());
  }

  renderSvg() {
    let edgesHtml = '<path d="M 26 105 L 58 105" class="dfa-edge dfa-det-edge" />';
    this.edges.forEach(edge => {
      edgesHtml += `
        <g class="dfa-edge-group">
          <path d="${edge.path}" class="dfa-edge dfa-det-edge" data-edge-id="${edge.id}" />
          <circle cx="${edge.lx}" cy="${edge.ly}" r="10" class="dfa-edge-label-bg" />
          <text x="${edge.lx}" y="${edge.ly}" class="dfa-edge-label">${edge.char}</text>
        </g>
      `;
    });
    this.elEdges.innerHTML = edgesHtml;

    let nodesHtml = '';
    for (const [id, state] of Object.entries(this.states)) {
      nodesHtml += `
        <g class="dfa-node-group" data-node-id="${id}">
          <circle cx="${state.x}" cy="${state.y}" r="26" class="dfa-node ${state.accept ? 'is-accept' : ''}" />
          ${state.accept ? `<circle cx="${state.x}" cy="${state.y}" r="21" class="dfa-node-inner" />` : ''}
          <text x="${state.x}" y="${state.y - 4}" class="dfa-node-label">${state.label}</text>
          <text x="${state.x}" y="${state.y + 14}" class="dfa-det-node-note">${state.note}</text>
        </g>
      `;
    }
    this.elNodes.innerHTML = nodesHtml;
  }

  reset() {
    this.pause();
    this.word = this.elInput.value;
    this.currentIndex = 0;
    this.currentState = 'q0';
    this.currentValue = 0;
    this.activeEdgeId = null;
    this.activeCell = null;
    this.elLog.className = 'dfa-log';
    this.updateUI('Pripravené. Začíname v stave q0, teda so zvyškom 0.');
  }

  updateUI(logMsg) {
    let tapeHtml = '';
    for (let i = 0; i < this.word.length; i++) {
      let cls = 'dfa-tape-cell';
      if (i < this.currentIndex) cls += ' is-past';
      if (i === this.currentIndex) cls += ' is-active';
      tapeHtml += `<div class="${cls}">${this.word[i]}</div>`;
    }
    if (!this.word.length) tapeHtml = '<div class="dfa-tape-cell" style="opacity:0.3">ε</div>';
    this.elTape.innerHTML = tapeHtml;

    Object.keys(this.states).forEach(id => {
      const node = this.container.querySelector(`[data-node-id="${id}"] .dfa-node`);
      if (node) node.classList.toggle('is-active', id === this.currentState);
      const row = this.container.querySelector(`.dfa-det-table tr[data-state="${id}"]`);
      if (row) row.classList.toggle('is-current', id === this.currentState);
    });

    this.edges.forEach(edge => {
      const path = this.container.querySelector(`[data-edge-id="${edge.id}"]`);
      if (path) path.classList.toggle('is-active', edge.id === this.activeEdgeId);
    });

    this.container.querySelectorAll('.dfa-det-table td').forEach(cell => {
      const isActive = this.activeCell &&
        cell.dataset.state === this.activeCell.state &&
        cell.dataset.char === this.activeCell.char;
      cell.classList.toggle('is-active', isActive);
    });

    const remainder = this.currentValue % 3;
    this.elRemainder.textContent = `zvyšok ${remainder}`;
    this.elValue.textContent = `hodnota prefixu: ${this.currentValue}`;

    const isDone = this.currentIndex >= this.word.length && this.word.length > 0;
    this.btnStep.disabled = isDone || this.word.length === 0;
    this.btnPlay.disabled = this.word.length === 0;

    if (isDone) {
      const accepted = this.currentState === 'q0';
      this.elLog.textContent = accepted
        ? 'Výpočet skončil. Zvyšok je 0, číslo je deliteľné 3.'
        : `Výpočet skončil. Zvyšok je ${remainder}, číslo nie je deliteľné 3.`;
      this.elLog.className = `dfa-log ${accepted ? 'is-accept' : 'is-reject'}`;
      this.btnPlay.disabled = true;
      this.setPlayButton(false);
      return;
    }

    if (logMsg) this.elLog.textContent = logMsg;
  }

  step() {
    if (this.currentIndex >= this.word.length) return;

    const char = this.word[this.currentIndex];
    const oldState = this.currentState;
    const oldRemainder = this.currentValue % 3;
    const transition = this.transitions[oldState][char];
    this.currentValue = this.currentValue * 2 + Number(char);
    this.currentState = transition.next;
    this.activeEdgeId = transition.edgeId;
    this.activeCell = { state: oldState, char };
    this.currentIndex++;

    const newRemainder = this.currentValue % 3;
    this.updateUI(`Čítam '${char}': (${oldRemainder} × 2 + ${char}) mod 3 = ${newRemainder}, prechod ${oldState} → ${this.currentState}.`);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentIndex >= this.word.length) this.reset();
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    this.setPlayButton(true);
    this.btnStep.disabled = true;
    this.elInput.disabled = true;
    this.playInterval = setInterval(() => {
      if (this.currentIndex >= this.word.length) {
        this.pause();
      } else {
        this.step();
      }
    }, 1000);
  }

  pause() {
    this.isPlaying = false;
    this.setPlayButton(false);
    this.btnStep.disabled = this.currentIndex >= this.word.length || this.word.length === 0;
    this.elInput.disabled = false;
    clearInterval(this.playInterval);
  }

  setPlayButton(isPlaying) {
    this.btnPlay.innerHTML = isPlaying ? DfaVisualizer.pauseIcon() : DfaVisualizer.playIcon();
    this.btnPlay.title = isPlaying ? 'Pauza' : 'Prehrať';
  }
}

window.DeterministicDfaVisualizer = DeterministicDfaVisualizer;

document.addEventListener('DOMContentLoaded', () => {
  const mountDfas = () => {
    document.querySelectorAll('.dfa-visualizer:not(.initialized)').forEach(el => {
      el.classList.add('initialized');
      new DfaVisualizer(el);
    });

    document.querySelectorAll('.dfa-deterministic-visualizer:not(.initialized)').forEach(el => {
      el.classList.add('initialized');
      new DeterministicDfaVisualizer(el);
    });
  };
  
  mountDfas();
  
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) mountDfas();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
