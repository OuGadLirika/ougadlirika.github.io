class SortVisualizer {
  constructor(container) {
    this.container = container;
    this.algorithm = container.dataset.algorithm;
    this.meta = SortVisualizer.META[this.algorithm] || SortVisualizer.META.bubble;
    this.size = 10;
    this.array = [];
    this.initialArray = [];
    this.bars = [];
    this.isSorting = false;
    this.hasCompletedRun = false;
    this.runMode = 'idle';
    this.stepResolver = null;
    this.isWaitingForStep = false;
    this.runToken = 0;
    this.activeRunToken = 0;
    this.metrics = { comparisons: 0, writes: 0 };

    this.init();
  }

  static META = {
    bubble: {
      label: 'Bubble sort',
      subtitle: 'Susedné prvky sa porovnávajú a podľa potreby vymieňajú.',
      complexity: ['best O(n)', 'worst O(n²)', 'space O(1)'],
      legend: [
        { kind: 'active', label: 'porovnanie' },
        { kind: 'swap', label: 'výmena' },
        { kind: 'sorted', label: 'zoradené' },
      ],
    },
    insertion: {
      label: 'Insertion sort',
      subtitle: 'Ďalší prvok sa vkladá do už usporiadanej ľavej časti.',
      complexity: ['best O(n)', 'worst O(n²)', 'space O(1)'],
      legend: [
        { kind: 'active', label: 'porovnanie' },
        { kind: 'key', label: 'vkladaná hodnota' },
        { kind: 'swap', label: 'presun' },
        { kind: 'sorted', label: 'zoradené' },
      ],
    },
    selection: {
      label: 'Selection sort',
      subtitle: 'V neusporiadanej časti sa hľadá minimum pre aktuálnu pozíciu.',
      complexity: ['best O(n²)', 'worst O(n²)', 'space O(1)'],
      legend: [
        { kind: 'active', label: 'porovnanie' },
        { kind: 'pivot', label: 'minimum' },
        { kind: 'swap', label: 'výmena' },
        { kind: 'sorted', label: 'zoradené' },
      ],
    },
    quick: {
      label: 'Quick-sort',
      subtitle: 'Pivot rozdelí pole na menšie a väčšie hodnoty.',
      complexity: ['avg O(n log n)', 'worst O(n²)', 'space O(log n)'],
      legend: [
        { kind: 'active', label: 'porovnanie' },
        { kind: 'pivot', label: 'pivot' },
        { kind: 'swap', label: 'výmena' },
        { kind: 'sorted', label: 'zoradené' },
      ],
    },
  };

  init() {
    this.generateArray();

    this.container.innerHTML = `
      <div class="sort-panel">
        <header class="sort-head">
          <div class="sort-title-block">
            <strong class="sort-title">${this.escapeHtml(this.meta.label)}</strong>
            <span class="sort-subtitle">${this.escapeHtml(this.meta.subtitle)}</span>
          </div>
          <div class="sort-complexity">
            ${this.meta.complexity.map(item => `<span>${this.escapeHtml(item)}</span>`).join('')}
          </div>
        </header>

        <div class="sort-stage">
          <div class="sort-bars"></div>
        </div>

        <div class="sort-readout">
          <div class="sort-status">Pripravené na spustenie</div>
          <div class="sort-metrics">
            <span><strong data-sort-metric="comparisons">0</strong> porovnaní</span>
            <span><strong data-sort-metric="writes">0</strong> výmen/presunov</span>
          </div>
        </div>

        <div class="sort-footer">
          <div class="sort-legend">
            ${this.renderLegend()}
          </div>
          <div class="sort-controls">
            <select class="sort-speed">
              <option value="480">pomaly</option>
              <option value="280" selected>normálne</option>
              <option value="120">rýchlo</option>
            </select>
            <button class="sort-btn sort-btn-step" type="button">Krok</button>
            <button class="sort-btn sort-btn-start" type="button" title="Spustiť">
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button class="sort-btn sort-btn-new" type="button" title="Nové pole">
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

    this.barsContainer = this.container.querySelector('.sort-bars');
    this.statusEl = this.container.querySelector('.sort-status');
    this.metricEls = {
      comparisons: this.container.querySelector('[data-sort-metric="comparisons"]'),
      writes: this.container.querySelector('[data-sort-metric="writes"]'),
    };
    this.btnNew = this.container.querySelector('.sort-btn-new');
    this.btnStep = this.container.querySelector('.sort-btn-step');
    this.btnStart = this.container.querySelector('.sort-btn-start');
    this.speedEl = this.container.querySelector('.sort-speed');

    this.btnNew.addEventListener('click', () => {
      this.resetVisualizer();
    });

    this.btnStep.addEventListener('click', () => this.stepSort());

    this.btnStart.addEventListener('click', () => {
      if (!this.isSorting) {
        this.startSort('auto');
      } else if (this.runMode === 'manual') {
        this.continueAutomatically();
      }
    });

    this.renderBars();
    this.syncControls();
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  renderLegend() {
    return this.meta.legend
      .map(item => (
        `<span><i class="sort-dot sort-dot-${this.escapeHtml(item.kind)}"></i>${this.escapeHtml(item.label)}</span>`
      ))
      .join('');
  }

  generateArray() {
    this.array = Array.from({ length: this.size }, () => Math.floor(Math.random() * 82) + 14);
    this.initialArray = [...this.array];
  }

  resetToInitialArray() {
    this.array = [...this.initialArray];
    this.renderBars();
  }

  renderBars() {
    this.barsContainer.innerHTML = '';
    this.bars = [];

    this.array.forEach((value, index) => {
      const item = document.createElement('div');
      item.className = 'sort-bar-container';
      item.style.setProperty('--bar-height', `${value}%`);

      const indexEl = document.createElement('span');
      indexEl.className = 'sort-index';
      indexEl.textContent = String(index);

      const bar = document.createElement('div');
      bar.className = 'sort-bar';

      const label = document.createElement('span');
      label.className = 'sort-label';
      label.textContent = String(value);

      item.appendChild(indexEl);
      item.appendChild(bar);
      item.appendChild(label);
      this.barsContainer.appendChild(item);
      this.bars.push({ item, bar, label, indexEl });
    });
  }

  currentDelay(multiplier = 1) {
    const value = Number(this.speedEl ? this.speedEl.value : 280);
    return value * multiplier;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  waitForStep() {
    this.isWaitingForStep = true;
    this.syncControls();
    return new Promise(resolve => {
      this.stepResolver = () => {
        this.isWaitingForStep = false;
        this.stepResolver = null;
        resolve();
      };
    });
  }

  releaseStep() {
    if (this.stepResolver) this.stepResolver();
  }

  async pausePoint(multiplier = 1) {
    const token = this.activeRunToken;
    if (this.runMode === 'manual') {
      await this.waitForStep();
    } else {
      await this.sleep(this.currentDelay(multiplier));
    }
    if (token !== this.runToken) throw new Error('sort-reset');
  }

  resetVisualizer() {
    this.runToken += 1;
    this.isSorting = false;
    this.runMode = 'idle';
    this.isWaitingForStep = false;
    this.hasCompletedRun = false;
    this.generateArray();
    this.resetMetrics();
    this.renderBars();
    this.syncControls();
    this.updateStatus('Nové pole pripravené');
    this.releaseStep();
  }

  syncControls() {
    const isAutoRunning = this.isSorting && this.runMode === 'auto';
    const isManualRunning = this.isSorting && this.runMode === 'manual';

    this.btnNew.disabled = false;
    this.btnStep.disabled = isAutoRunning;
    this.btnStart.disabled = isAutoRunning;

    if (isAutoRunning) {
      this.btnStart.title = 'Beží';
    } else if (isManualRunning) {
      this.btnStart.title = 'Pokračovať';
    } else {
      this.btnStart.title = this.hasCompletedRun ? 'Znova spustiť' : 'Spustiť';
    }
  }

  updateStatus(text) {
    this.statusEl.textContent = text;
  }

  resetMetrics() {
    this.metrics = { comparisons: 0, writes: 0 };
    this.syncMetrics();
  }

  syncMetrics() {
    this.metricEls.comparisons.textContent = String(this.metrics.comparisons);
    this.metricEls.writes.textContent = String(this.metrics.writes);
  }

  countComparison() {
    this.metrics.comparisons += 1;
    this.syncMetrics();
  }

  countWrite(amount = 1) {
    this.metrics.writes += amount;
    this.syncMetrics();
  }

  setState(index, states = []) {
    const item = this.bars[index] && this.bars[index].item;
    if (!item) return;
    item.classList.remove('is-active', 'is-swap', 'is-sorted', 'is-pivot', 'is-key', 'is-range', 'is-min');
    states.forEach(state => item.classList.add(`is-${state}`));
  }

  addState(index, state) {
    const item = this.bars[index] && this.bars[index].item;
    if (item) item.classList.add(`is-${state}`);
  }

  removeState(index, state) {
    const item = this.bars[index] && this.bars[index].item;
    if (item) item.classList.remove(`is-${state}`);
  }

  clearTransientStates({ keepRange = false } = {}) {
    this.bars.forEach(({ item }) => {
      item.classList.remove('is-active', 'is-swap', 'is-pivot', 'is-key', 'is-min');
      if (!keepRange) item.classList.remove('is-range');
    });
  }

  markRange(low, high) {
    this.bars.forEach(({ item }, index) => {
      item.classList.toggle('is-range', index >= low && index <= high);
    });
  }

  markSorted(index) {
    this.clearTransientStates({ keepRange: true });
    this.addState(index, 'sorted');
  }

  setValue(index, value) {
    this.array[index] = value;
    const bar = this.bars[index];
    if (!bar) return;
    this.setVisualValue(index, value);
  }

  setVisualValue(index, value) {
    const bar = this.bars[index];
    if (!bar) return;
    bar.item.style.setProperty('--bar-height', `${value}%`);
    bar.label.textContent = String(value);
  }

  async swap(i, j) {
    if (i === j) return;
    const left = this.array[i];
    const right = this.array[j];
    this.setValue(i, right);
    this.setValue(j, left);
    this.countWrite(2);
  }

  stepSort() {
    if (this.runMode === 'auto') return;
    if (!this.isSorting) {
      this.startSort('manual');
      return;
    }
    this.releaseStep();
  }

  continueAutomatically() {
    this.runMode = 'auto';
    this.syncControls();
    this.releaseStep();
  }

  async startSort(mode = 'auto') {
    const token = this.runToken;
    this.activeRunToken = token;
    this.isSorting = true;
    this.runMode = mode;
    this.isWaitingForStep = false;
    this.stepResolver = null;
    this.syncControls();

    if (this.hasCompletedRun) this.resetToInitialArray();
    this.resetMetrics();
    this.clearTransientStates();

    try {
      switch (this.algorithm) {
        case 'bubble':
          await this.bubbleSort();
          break;
        case 'insertion':
          await this.insertionSort();
          break;
        case 'selection':
          await this.selectionSort();
          break;
        case 'quick':
          await this.quickSortMain();
          break;
      }
    } catch (error) {
      if (error && error.message === 'sort-reset') return;
      throw error;
    }

    if (token !== this.runToken) return;

    this.bars.forEach((_, index) => this.addState(index, 'sorted'));
    this.clearTransientStates();
    this.bars.forEach((_, index) => this.addState(index, 'sorted'));
    this.updateStatus('Pole je usporiadané');

    this.isSorting = false;
    this.runMode = 'idle';
    this.isWaitingForStep = false;
    this.stepResolver = null;
    this.hasCompletedRun = true;
    this.syncControls();
  }

  async bubbleSort() {
    const n = this.array.length;
    for (let pass = 0; pass < n - 1; pass += 1) {
      let swapped = false;
      this.updateStatus(`Prechod ${pass + 1}: najväčšia hodnota prebubláva doprava`);

      for (let j = 0; j < n - pass - 1; j += 1) {
        this.clearTransientStates({ keepRange: true });
        this.addState(j, 'active');
        this.addState(j + 1, 'active');
        this.countComparison();
        this.updateStatus(`Porovnávam ${this.array[j]} a ${this.array[j + 1]}`);
        await this.pausePoint();

        if (this.array[j] > this.array[j + 1]) {
          this.addState(j, 'swap');
          this.addState(j + 1, 'swap');
          this.updateStatus(`${this.array[j]} je väčšie, dvojica sa vymení`);
          await this.pausePoint(.75);
          await this.swap(j, j + 1);
          swapped = true;
        }
      }

      this.addState(n - pass - 1, 'sorted');
      if (!swapped) {
        this.updateStatus('Bez výmeny: zvyšok poľa je už usporiadaný');
        break;
      }
    }
  }

  async insertionSort() {
    this.addState(0, 'sorted');

    for (let i = 1; i < this.array.length; i += 1) {
      const key = this.array[i];
      let j = i - 1;
      this.clearTransientStates({ keepRange: true });
      this.addState(i, 'key');
      this.updateStatus(`Vkladám ${key} do usporiadanej ľavej časti`);
      await this.pausePoint(1.15);

      while (j >= 0) {
        this.clearTransientStates({ keepRange: true });
        this.addState(j, 'active');
        this.addState(j + 1, 'key');
        this.setVisualValue(j + 1, key);
        this.countComparison();
        this.updateStatus(`Porovnávam ${this.array[j]} s vkladanou hodnotou ${key}`);
        await this.pausePoint();

        if (this.array[j] <= key) break;

        this.addState(j, 'swap');
        this.addState(j + 1, 'swap');
        this.updateStatus(`${this.array[j]} sa posúva doprava`);
        await this.pausePoint(.75);
        this.setValue(j + 1, this.array[j]);
        this.countWrite();
        j -= 1;
      }

      this.setValue(j + 1, key);
      this.countWrite();
      for (let k = 0; k <= i; k += 1) this.addState(k, 'sorted');
    }
  }

  async selectionSort() {
    const n = this.array.length;

    for (let i = 0; i < n - 1; i += 1) {
      let minIdx = i;
      this.clearTransientStates();
      this.addState(i, 'min');
      this.updateStatus(`Pozícia ${i}: hľadám najmenšiu hodnotu vpravo`);

      for (let j = i + 1; j < n; j += 1) {
        this.clearTransientStates({ keepRange: true });
        this.addState(minIdx, 'min');
        this.addState(j, 'active');
        this.countComparison();
        this.updateStatus(`Porovnávam ${this.array[j]} s minimom ${this.array[minIdx]}`);
        await this.pausePoint();

        if (this.array[j] < this.array[minIdx]) {
          minIdx = j;
          this.clearTransientStates({ keepRange: true });
          this.addState(minIdx, 'min');
          this.updateStatus(`Nové minimum je ${this.array[minIdx]}`);
          await this.pausePoint(.65);
        }
      }

      if (minIdx !== i) {
        this.addState(i, 'swap');
        this.addState(minIdx, 'swap');
        this.updateStatus(`Minimum ${this.array[minIdx]} ide na pozíciu ${i}`);
        await this.pausePoint();
        await this.swap(i, minIdx);
      }
      this.addState(i, 'sorted');
    }

    this.addState(n - 1, 'sorted');
  }

  async quickSortMain() {
    await this.quickSort(0, this.array.length - 1);
    this.bars.forEach((_, index) => this.addState(index, 'sorted'));
  }

  async quickSort(low, high) {
    if (low > high) return;
    if (low === high) {
      this.addState(low, 'sorted');
      return;
    }

    this.markRange(low, high);
    this.updateStatus(`Delím úsek od indexu ${low} po ${high}`);
    await this.pausePoint(.75);

    const pivotIndex = await this.partition(low, high);
    this.addState(pivotIndex, 'sorted');
    await this.quickSort(low, pivotIndex - 1);
    await this.quickSort(pivotIndex + 1, high);
  }

  async partition(low, high) {
    const pivot = this.array[high];
    let boundary = low - 1;

    this.clearTransientStates({ keepRange: true });
    this.addState(high, 'pivot');
    this.updateStatus(`Pivot je ${pivot}`);
    await this.pausePoint();

    for (let j = low; j < high; j += 1) {
      this.clearTransientStates({ keepRange: true });
      this.addState(high, 'pivot');
      this.addState(j, 'active');
      this.countComparison();
      this.updateStatus(`Je ${this.array[j]} menšie než pivot ${pivot}?`);
      await this.pausePoint();

      if (this.array[j] < pivot) {
        boundary += 1;
        this.addState(boundary, 'swap');
        this.addState(j, 'swap');
        this.updateStatus(`${this.array[j]} patrí do ľavej časti`);
        await this.pausePoint(.7);
        await this.swap(boundary, j);
      }
    }

    this.clearTransientStates({ keepRange: true });
    this.addState(boundary + 1, 'swap');
    this.addState(high, 'pivot');
    this.updateStatus(`Pivot sa presunie medzi menšie a väčšie hodnoty`);
    await this.pausePoint();
    await this.swap(boundary + 1, high);

    this.clearTransientStates({ keepRange: true });
    return boundary + 1;
  }
}

function initSortVisualizers() {
  document.querySelectorAll('.sort-visualizer:not([data-initialized])').forEach(container => {
    new SortVisualizer(container);
    container.setAttribute('data-initialized', 'true');
  });
}

const sortObserver = new MutationObserver(() => initSortVisualizers());

document.addEventListener('DOMContentLoaded', () => {
  const proseEl = document.querySelector('.prose') || document.body;
  sortObserver.observe(proseEl, { childList: true, subtree: true });
  initSortVisualizers();
});
