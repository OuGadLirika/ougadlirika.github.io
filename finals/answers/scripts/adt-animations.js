class ADTVisualizer {
  constructor(container) {
    this.container = container;
    this.type = container.dataset.type;
    this.meta = ADTVisualizer.META[this.type] || ADTVisualizer.META.stack;
    this.maxElements = this.type === 'linked-list' ? 5 : 6;
    this.elements = this.randomElements(this.meta.seed.length);
    this.isAnimating = false;
    this.runToken = 0;
    this.activeRunToken = 0;
    this.highlight = null;
    this.trace = [];

    this.init();
  }

  static META = {
    stack: {
      title: 'Zásobník (stack)',
      rule: 'LIFO',
      ruleText: 'Last In, First Out',
      subtitle: 'Pracuje sa iba s vrchom zásobníka: posledný vložený prvok odchádza prvý.',
      seed: [31, 54, 72],
      operations: [
        ['push(x)', 'vloží prvok na top', 'O(1)'],
        ['pop()', 'odoberie top', 'O(1)'],
        ['peek()', 'pozrie top bez odobratia', 'O(1)'],
      ],
      controls: [
        ['add', 'Push'],
        ['remove', 'Pop'],
        ['peek', 'Peek'],
      ],
    },
    queue: {
      title: 'Front (queue)',
      rule: 'FIFO',
      ruleText: 'First In, First Out',
      subtitle: 'Nový prvok ide na koniec frontu, odoberá sa vždy prvý čakajúci prvok.',
      seed: [18, 43, 67],
      operations: [
        ['enqueue(x)', 'pridá prvok na rear', 'O(1)'],
        ['dequeue()', 'odoberie front', 'O(1)'],
        ['front()', 'pozrie prvý prvok', 'O(1)'],
      ],
      controls: [
        ['add', 'Enqueue'],
        ['remove', 'Dequeue'],
        ['peek', 'Front'],
      ],
    },
    'linked-list': {
      title: 'Zreťazený zoznam',
      rule: 'HEAD',
      ruleText: 'uzly + pointery',
      subtitle: 'Uzol drží dáta a odkaz na ďalší uzol; pri vložení na začiatok sa prepája head.',
      seed: [24, 51, 86],
      operations: [
        ['insertFirst(x)', 'nový uzol sa stane head', 'O(1)'],
        ['removeFirst()', 'head sa posunie na ďalší uzol', 'O(1)'],
        ['search(x)', 'sekvenčný prechod', 'O(n)'],
      ],
      controls: [
        ['add', 'Vlož head'],
        ['remove', 'Vymaž head'],
        ['peek', 'Ukáž head'],
        ['search', 'Nájdi'],
      ],
    },
  };

  init() {
    this.container.innerHTML = `
      <section class="adt-panel adt-panel--${this.escapeHtml(this.type)}">
        <header class="adt-head">
          <div class="adt-title-block">
            <strong class="adt-title">${this.escapeHtml(this.meta.title)}</strong>
            <span class="adt-subtitle">${this.escapeHtml(this.meta.subtitle)}</span>
          </div>
          <div class="adt-rule">
            <span class="adt-rule-code">${this.escapeHtml(this.meta.rule)}</span>
            <span class="adt-rule-text">${this.escapeHtml(this.meta.ruleText)}</span>
          </div>
        </header>

        <div class="adt-body">
          <div class="adt-stage">
            <div class="adt-stage-labels"></div>
            <div class="adt-structure"></div>
          </div>

          <aside class="adt-side">
            <div class="adt-side-section">
              <span class="adt-side-title">Operácie</span>
              <div class="adt-ops">
                ${this.meta.operations.map(([name, text, cost]) => `
                  <div class="adt-op">
                    <code>${this.escapeHtml(name)}</code>
                    <span>${this.escapeHtml(text)}</span>
                    <b>${this.escapeHtml(cost)}</b>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="adt-side-section">
              <span class="adt-side-title">Posledné kroky</span>
              <ol class="adt-trace"></ol>
            </div>
          </aside>
        </div>

        <div class="adt-readout">
          <div class="adt-status">Pripravené: sleduj, z ktorej strany sa pridáva a odoberá.</div>
          <div class="adt-metrics">
            <span><strong data-adt-focus-label>-</strong> <b data-adt-focus-value>-</b></span>
          </div>
        </div>

        <div class="adt-controls">
          ${this.meta.controls.map(([action, label]) => this.renderControl(action, label)).join('')}
          <button class="adt-btn adt-btn-reset" type="button" data-adt-action="reset" title="Reset">
            <svg viewBox="0 0 24 24">
              <path d="M20 6v5h-5"/>
              <path d="M4 18v-5h5"/>
              <path d="M18.2 9A7 7 0 0 0 6.8 6.8L4 9.5"/>
              <path d="M5.8 15A7 7 0 0 0 17.2 17.2L20 14.5"/>
            </svg>
          </button>
        </div>
      </section>
    `;

    this.stageLabelsEl = this.container.querySelector('.adt-stage-labels');
    this.structureEl = this.container.querySelector('.adt-structure');
    this.statusEl = this.container.querySelector('.adt-status');
    this.traceEl = this.container.querySelector('.adt-trace');
    this.focusLabelEl = this.container.querySelector('[data-adt-focus-label]');
    this.focusValueEl = this.container.querySelector('[data-adt-focus-value]');
    this.searchInputEl = this.container.querySelector('[data-adt-search-value]');
    this.buttons = Array.from(this.container.querySelectorAll('[data-adt-action]'));

    this.buttons.forEach(button => {
      button.addEventListener('click', () => this.handleAction(button.dataset.adtAction));
    });
    if (this.searchInputEl) {
      this.searchInputEl.addEventListener('input', () => this.syncButtons());
    }

    this.pushTrace('Začiatočný stav: ' + this.elements.join(', '));
    this.render();
    this.syncButtons();
  }

  renderControl(action, label) {
    if (this.type === 'linked-list' && action === 'search') {
      return `
        <div class="adt-search-control">
          <input class="adt-input" type="number" inputmode="numeric" placeholder="hodnota" data-adt-search-value>
          <button class="adt-btn" type="button" data-adt-action="${this.escapeHtml(action)}">${this.escapeHtml(label)}</button>
        </div>
      `;
    }

    return `<button class="adt-btn" type="button" data-adt-action="${this.escapeHtml(action)}">${this.escapeHtml(label)}</button>`;
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  sleep(ms = 420) {
    const token = this.activeRunToken;
    return new Promise(resolve => setTimeout(resolve, ms)).then(() => {
      if (token !== this.runToken) throw new Error('adt-reset');
    });
  }

  randomValue() {
    let value = Math.floor(Math.random() * 82) + 12;
    while (this.elements.includes(value)) value = Math.floor(Math.random() * 82) + 12;
    return value;
  }

  randomElements(count) {
    const values = [];
    while (values.length < count) {
      const value = Math.floor(Math.random() * 82) + 12;
      if (!values.includes(value)) values.push(value);
    }
    return values;
  }

  handleAction(action) {
    if (action === 'reset') {
      this.reset();
      return;
    }
    if (this.isAnimating) return;
    let task = null;
    if (action === 'add') task = this.add();
    if (action === 'remove') task = this.remove();
    if (action === 'peek') task = this.peek();
    if (action === 'search') task = this.search();
    if (task) {
      task.catch(error => {
        if (!error || error.message !== 'adt-reset') throw error;
      });
    }
  }

  setBusy(value) {
    if (value) this.activeRunToken = this.runToken;
    this.isAnimating = value;
    this.syncButtons();
  }

  syncButtons() {
    const missingSearchValue = this.searchInputEl && this.searchInputEl.value.trim() === '';
    this.buttons.forEach(button => {
      const action = button.dataset.adtAction;
      const full = this.elements.length >= this.maxElements;
      const empty = this.elements.length === 0;
      button.disabled =
        (action !== 'reset' && this.isAnimating) ||
        (action === 'add' && full) ||
        ((action === 'remove' || action === 'peek' || action === 'search') && empty) ||
        (action === 'search' && this.type !== 'linked-list') ||
        (action === 'search' && this.type === 'linked-list' && missingSearchValue);
    });
  }

  pushTrace(text) {
    this.trace.unshift(text);
    this.trace = this.trace.slice(0, 5);
    if (!this.traceEl) return;
    this.traceEl.innerHTML = this.trace
      .map((item, index) => `
        <li>
          <span class="adt-trace-num">${this.trace.length - index}.</span>
          <span class="adt-trace-text">${this.escapeHtml(item)}</span>
        </li>
      `)
      .join('');
  }

  updateStatus(text) {
    this.statusEl.textContent = text;
  }

  focusInfo() {
    if (this.type === 'stack') {
      return { label: 'TOP', value: this.elements.length ? this.elements[this.elements.length - 1] : '-' };
    }
    if (this.type === 'queue') {
      return { label: 'FRONT', value: this.elements.length ? this.elements[0] : '-' };
    }
    return { label: 'HEAD', value: this.elements.length ? this.elements[0] : '-' };
  }

  render() {
    const focus = this.focusInfo();
    this.focusLabelEl.textContent = focus.label;
    this.focusValueEl.textContent = String(focus.value);

    if (this.type === 'stack') this.renderStack();
    if (this.type === 'queue') this.renderQueue();
    if (this.type === 'linked-list') this.renderLinkedList();
  }

  renderStageLabels(labels) {
    this.stageLabelsEl.innerHTML = labels
      .map(label => `<span style="${this.escapeHtml(label.style || '')}">${this.escapeHtml(label.text)}</span>`)
      .join('');
  }

  markerClass(index) {
    if (!this.highlight || this.highlight.index !== index) return '';
    return ` is-${this.highlight.kind}`;
  }

  renderNode(value, index, extra = '') {
    return `<div class="adt-node${this.markerClass(index)}${extra}" data-index="${index}">
      <span class="adt-node-value">${this.escapeHtml(value)}</span>
      <span class="adt-node-index">${index}</span>
    </div>`;
  }

  renderStack() {
    this.renderStageLabels([
      { text: 'TOP', style: 'justify-self:center' },
    ]);
    const nodes = this.elements
      .map((value, index) => this.renderNode(value, index))
      .reverse()
      .join('');
    this.structureEl.className = 'adt-structure adt-stack';
    this.structureEl.innerHTML = `<div class="adt-stack-shell">${nodes || '<span class="adt-empty">empty</span>'}</div>`;
  }

  renderQueue() {
    this.renderStageLabels([
      { text: 'FRONT', style: 'justify-self:start' },
      { text: 'REAR', style: 'justify-self:end' },
    ]);
    const nodes = this.elements.map((value, index) => this.renderNode(value, index)).join('');
    this.structureEl.className = 'adt-structure adt-queue';
    this.structureEl.innerHTML = nodes || '<span class="adt-empty">empty</span>';
  }

  renderLinkedList() {
    this.renderStageLabels([
      { text: 'HEAD', style: 'justify-self:start' },
      { text: 'NULL', style: 'justify-self:end' },
    ]);
    const nodes = this.elements.map((value, index) => `
      <div class="adt-list-item">
        <div class="adt-ll-node${this.markerClass(index)}">
          <span class="adt-ll-data">${this.escapeHtml(value)}</span>
          <span class="adt-ll-next">next</span>
        </div>
        <span class="adt-arrow">→</span>
      </div>
    `).join('');
    this.structureEl.className = 'adt-structure adt-linked-list';
    this.structureEl.innerHTML = `${nodes}<span class="adt-null">NULL</span>`;
  }

  async add() {
    if (this.elements.length >= this.maxElements) return;
    this.setBusy(true);
    const value = this.randomValue();

    if (this.type === 'stack') {
      this.updateStatus(`push(${value}): nový prvok ide na vrch zásobníka.`);
      this.elements.push(value);
      this.highlight = { index: this.elements.length - 1, kind: 'insert' };
      this.pushTrace(`push(${value}) → nový top`);
    } else if (this.type === 'queue') {
      this.updateStatus(`enqueue(${value}): prvok sa zaradí na koniec frontu.`);
      this.elements.push(value);
      this.highlight = { index: this.elements.length - 1, kind: 'insert' };
      this.pushTrace(`enqueue(${value}) → rear`);
    } else {
      this.updateStatus(`insertFirst(${value}): nový uzol ukáže na pôvodný head.`);
      this.elements.unshift(value);
      this.highlight = { index: 0, kind: 'insert' };
      this.pushTrace(`insertFirst(${value}) → head`);
    }

    this.render();
    await this.sleep();
    this.highlight = null;
    this.render();
    this.updateStatus('Operácia hotová. Všimni si, že sa menil iba okraj štruktúry.');
    this.setBusy(false);
  }

  async remove() {
    if (!this.elements.length) return;
    this.setBusy(true);

    let value;
    if (this.type === 'stack') {
      const index = this.elements.length - 1;
      value = this.elements[index];
      this.highlight = { index, kind: 'remove' };
      this.updateStatus(`pop(): odoberá sa top, teda hodnota ${value}.`);
      this.render();
      await this.sleep();
      this.elements.pop();
      this.pushTrace(`pop() → ${value}`);
    } else if (this.type === 'queue') {
      value = this.elements[0];
      this.highlight = { index: 0, kind: 'remove' };
      this.updateStatus(`dequeue(): odoberá sa front, teda hodnota ${value}.`);
      this.render();
      await this.sleep();
      this.elements.shift();
      this.pushTrace(`dequeue() → ${value}`);
    } else {
      value = this.elements[0];
      this.highlight = { index: 0, kind: 'remove' };
      this.updateStatus(`removeFirst(): head (${value}) sa zahodí a head sa posunie na ďalší uzol.`);
      this.render();
      await this.sleep();
      this.elements.shift();
      this.pushTrace(`removeFirst() → ${value}`);
    }

    this.highlight = null;
    this.render();
    this.updateStatus(this.elements.length ? 'Operácia hotová, štruktúra ostáva konzistentná.' : 'Štruktúra je prázdna.');
    this.setBusy(false);
  }

  async peek() {
    if (!this.elements.length) return;
    this.setBusy(true);

    let index = 0;
    let name = 'head';
    if (this.type === 'stack') {
      index = this.elements.length - 1;
      name = 'top';
    } else if (this.type === 'queue') {
      name = 'front';
    }

    const value = this.elements[index];
    this.highlight = { index, kind: 'peek' };
    this.updateStatus(`${name}() iba číta hodnotu ${value}; štruktúra sa nemení.`);
    this.pushTrace(`${name}() → ${value}`);
    this.render();
    await this.sleep(650);
    this.highlight = null;
    this.render();
    this.setBusy(false);
  }

  async search() {
    if (this.type !== 'linked-list' || !this.elements.length) return;
    const target = Number(this.searchInputEl.value);
    if (!Number.isFinite(target)) {
      this.updateStatus('Zadaj hodnotu, ktorú chceš hľadať.');
      this.syncButtons();
      return;
    }

    this.setBusy(true);

    this.updateStatus(`search(${target}): začínam na head a idem postupne cez pointery.`);
    this.pushTrace(`search(${target})`);

    for (let index = 0; index < this.elements.length; index += 1) {
      this.highlight = { index, kind: 'peek' };
      this.render();
      this.updateStatus(`Kontrolujem uzol ${index}: ${this.elements[index]}`);
      await this.sleep(520);

      if (this.elements[index] === target) {
        this.updateStatus(`Nájdené: hodnota ${target} je v uzle ${index}.`);
        this.pushTrace(`nájdené v indexe ${index}`);
        await this.sleep(500);
        this.highlight = null;
        this.render();
        this.setBusy(false);
        return;
      }
    }

    this.highlight = null;
    this.render();
    this.updateStatus(`Hodnota ${target} v zozname nie je; prešli sme až po NULL.`);
    this.pushTrace('nenájdené → NULL');
    this.setBusy(false);
  }

  reset() {
    this.runToken += 1;
    this.isAnimating = false;
    this.elements = this.randomElements(this.meta.seed.length);
    this.highlight = null;
    this.trace = [];
    if (this.searchInputEl) this.searchInputEl.value = '';
    this.pushTrace('Reset: nový stav ' + this.elements.join(', '));
    this.updateStatus('Pripravené: sleduj, z ktorej strany sa pridáva a odoberá.');
    this.render();
    this.syncButtons();
  }
}

function initADTVisualizers() {
  document.querySelectorAll('.adt-visualizer:not([data-initialized])').forEach(container => {
    new ADTVisualizer(container);
    container.setAttribute('data-initialized', 'true');
  });
}

const adtObserver = new MutationObserver(() => initADTVisualizers());

document.addEventListener('DOMContentLoaded', () => {
  const proseEl = document.querySelector('.prose') || document.body;
  adtObserver.observe(proseEl, { childList: true, subtree: true });
  initADTVisualizers();
});
