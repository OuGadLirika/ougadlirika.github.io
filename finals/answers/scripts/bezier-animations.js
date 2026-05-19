class BezierVisualizer {
  constructor(container) {
    this.container = container;
    this.width = 600;
    this.height = 400;

    // Four points for a cubic Bézier curve / illustrative interpolation curve.
    this.points = [
      { x: 50, y: 350 },
      { x: 150, y: 50 },
      { x: 450, y: 50 },
      { x: 550, y: 350 }
    ];

    this.activePointIndex = null;
    this.curveType = 'bezier';

    this.handlePointerMove = (event) => this.drag(event);
    this.handlePointerUp = () => this.dragEnd();
    this.handleThemeChange = (mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === 'data-theme')) {
        this.draw();
      }
    };

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="bezier-stage">
        <div class="bezier-stage-head">
          <p class="bezier-kicker">Krivka a riadiace body</p>
          <p class="bezier-hint">Potiahni body P0 až P3 a sleduj, ako sa pri rôznych typoch kriviek mení ich význam.</p>
        </div>
        <div class="bezier-container" style="--bezier-aspect: ${this.width} / ${this.height};">
          <canvas class="bezier-canvas" width="${this.width}" height="${this.height}"></canvas>
        </div>
        <div class="bezier-stage-foot">
          <div class="bezier-status"></div>
        </div>
      </div>
      <div class="bezier-panel">
        <div class="bezier-card">
          <p class="bezier-card-title">Typ krivky</p>
          <div class="bezier-mode-switch">
            <button class="bezier-mode-btn" id="btn-bezier" type="button">Aproximačná</button>
            <button class="bezier-mode-btn" id="btn-interpolation" type="button">Interpolačná</button>
          </div>
        </div>
        <div class="bezier-card">
          <p class="bezier-card-title">Interpretácia</p>
          <p class="bezier-summary-title" id="bezier-summary-title"></p>
          <p class="bezier-summary-text" id="bezier-summary-text"></p>
        </div>
        <div class="bezier-card">
          <p class="bezier-card-title">Legenda</p>
          <div class="bezier-legend" id="bezier-legend"></div>
        </div>
        <div class="bezier-card">
          <p class="bezier-card-title">Body</p>
          <div class="bezier-points-list" id="bezier-points-list"></div>
        </div>
      </div>
    `;

    this.drawArea = this.container.querySelector('.bezier-container');
    this.canvas = this.container.querySelector('.bezier-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.statusEl = this.container.querySelector('.bezier-status');
    this.summaryTitleEl = this.container.querySelector('#bezier-summary-title');
    this.summaryTextEl = this.container.querySelector('#bezier-summary-text');
    this.legendEl = this.container.querySelector('#bezier-legend');
    this.pointsListEl = this.container.querySelector('#bezier-points-list');
    this.btnBezier = this.container.querySelector('#btn-bezier');
    this.btnInterpolation = this.container.querySelector('#btn-interpolation');

    this.btnBezier.addEventListener('click', () => this.setCurveType('bezier'));
    this.btnInterpolation.addEventListener('click', () => this.setCurveType('interpolation'));

    this.pointElements = this.points.map((point, index) => {
      const element = document.createElement('div');
      element.className = 'bezier-point';
      element.dataset.index = String(index);
      element.dataset.label = `P${index}`;
      element.addEventListener('pointerdown', (event) => this.dragStart(event, index));
      this.drawArea.appendChild(element);
      return element;
    });

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);

    this.themeObserver = new MutationObserver(this.handleThemeChange);
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    this.setCurveType('bezier');
  }

  getModeConfig() {
    if (this.curveType === 'bezier') {
      return {
        title: 'Aproximačná Bézierova krivka',
        description: 'Krivka prechádza len krajnými bodmi P0 a P3. Body P1 a P2 určujú smer tečníc a intenzitu zakrivenia, ale samotná krivka nimi neprechádza.',
        status: 'Riadiaci polygón určuje tvar krivky a krivka ostáva v jeho konvexnej obálke. Skús potiahnuť P1 alebo P2 a sleduj, ako sa krivka ohne bez toho, aby musela cez daný bod prejsť.',
        roleLabels: ['Koncový bod', 'Riadiaci bod', 'Riadiaci bod', 'Koncový bod'],
        pointKinds: ['anchor', 'control', 'control', 'anchor'],
        legend: [
          { kind: 'anchor', label: 'Koncový bod' },
          { kind: 'control', label: 'Riadiaci bod' },
          { kind: 'curve', label: 'Bézierova krivka' },
          { kind: 'dashed', label: 'Riadiaci polygón' }
        ]
      };
    }

    return {
      title: 'Interpolačná krivka cez body',
      description: 'Krivka prechádza cez všetky štyri body. Toto je ilustrácia princípu interpolácie: body P1 a P2 už nie sú len ovládače tvaru, ale skutočné body krivky.',
      status: 'V tomto režime krivka prejde cez P0, P1, P2 aj P3. Prerušovaná lomená čiara ukazuje poradie uzlových bodov; v prednáške je typickým interpolačným príkladom Fergusonova kubika s krajnými bodmi a dotykovými vektormi.',
      roleLabels: ['Koncový bod', 'Prechodový bod', 'Prechodový bod', 'Koncový bod'],
      pointKinds: ['anchor', 'interpolated', 'interpolated', 'anchor'],
      legend: [
        { kind: 'anchor', label: 'Koncový bod' },
        { kind: 'interpolated', label: 'Bod, cez ktorý krivka prejde' },
        { kind: 'curve', label: 'Interpolačná krivka' },
        { kind: 'dashed', label: 'Pomocná lomená čiara' }
      ]
    };
  }

  setCurveType(type) {
    this.curveType = type;
    this.updateButtonState();
    this.updatePointStyles();
    this.renderSidebar();
    this.draw();
  }

  updateButtonState() {
    const isBezier = this.curveType === 'bezier';
    this.btnBezier.classList.toggle('is-active', isBezier);
    this.btnInterpolation.classList.toggle('is-active', !isBezier);
  }

  updatePointStyles() {
    const config = this.getModeConfig();
    this.pointElements.forEach((element, index) => {
      element.classList.remove('is-anchor', 'is-control', 'is-interpolated');
      element.classList.add(`is-${config.pointKinds[index]}`);
      this.updatePointPosition(index);
    });
  }

  updatePointPosition(index) {
    const point = this.points[index];
    const element = this.pointElements[index];
    element.style.left = `${(point.x / this.width) * 100}%`;
    element.style.top = `${(point.y / this.height) * 100}%`;
  }

  renderSidebar() {
    const config = this.getModeConfig();

    this.summaryTitleEl.textContent = config.title;
    this.summaryTextEl.textContent = config.description;
    this.statusEl.textContent = config.status;

    this.legendEl.innerHTML = config.legend
      .map((item) => (
        `<div class="bezier-legend-item">` +
          `<span class="bezier-legend-swatch is-${item.kind}"></span>` +
          `<span class="bezier-legend-label">${item.label}</span>` +
        `</div>`
      ))
      .join('');

    this.pointsListEl.innerHTML = this.points
      .map((point, index) => (
        `<div class="bezier-point-row">` +
          `<div class="bezier-point-meta">` +
            `<span class="bezier-point-chip is-${config.pointKinds[index]}">P${index}</span>` +
            `<span class="bezier-point-role">${config.roleLabels[index]}</span>` +
          `</div>` +
          `<span class="bezier-point-coords">(${Math.round(point.x)}, ${Math.round(point.y)})</span>` +
        `</div>`
      ))
      .join('');
  }

  dragStart(event, index) {
    event.preventDefault();
    this.activePointIndex = index;
    this.pointElements[index].classList.add('is-dragging');
  }

  drag(event) {
    if (this.activePointIndex === null) return;

    const rect = this.drawArea.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * this.width;
    let y = ((event.clientY - rect.top) / rect.height) * this.height;

    x = Math.max(0, Math.min(this.width, x));
    y = Math.max(0, Math.min(this.height, y));

    this.points[this.activePointIndex].x = x;
    this.points[this.activePointIndex].y = y;

    this.updatePointPosition(this.activePointIndex);
    this.renderSidebar();
    this.draw();
  }

  dragEnd() {
    if (this.activePointIndex === null) return;
    this.pointElements[this.activePointIndex].classList.remove('is-dragging');
    this.activePointIndex = null;
  }

  drawReferencePolyline(points, strokeStyle) {
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      this.ctx.lineTo(points[index].x, points[index].y);
    }
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([6, 6]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawBezierCurve(strokeStyle) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    this.ctx.bezierCurveTo(
      this.points[1].x, this.points[1].y,
      this.points[2].x, this.points[2].y,
      this.points[3].x, this.points[3].y
    );
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
  }

  drawInterpolationCurve(strokeStyle) {
    const [p0, p1, p2, p3] = this.points;
    const splinePoints = [
      { x: p0.x - (p1.x - p0.x), y: p0.y - (p1.y - p0.y) },
      p0, p1, p2, p3,
      { x: p3.x + (p3.x - p2.x), y: p3.y + (p3.y - p2.y) }
    ];

    this.ctx.beginPath();

    for (let segment = 0; segment < 3; segment += 1) {
      const pA = splinePoints[segment];
      const pB = splinePoints[segment + 1];
      const pC = splinePoints[segment + 2];
      const pD = splinePoints[segment + 3];

      for (let t = 0; t <= 1.0001; t += 0.04) {
        const t2 = t * t;
        const t3 = t2 * t;

        const x = 0.5 * (
          (2 * pB.x) +
          (-pA.x + pC.x) * t +
          (2 * pA.x - 5 * pB.x + 4 * pC.x - pD.x) * t2 +
          (-pA.x + 3 * pB.x - 3 * pC.x + pD.x) * t3
        );

        const y = 0.5 * (
          (2 * pB.y) +
          (-pA.y + pC.y) * t +
          (2 * pA.y - 5 * pB.y + 4 * pC.y - pD.y) * t2 +
          (-pA.y + 3 * pB.y - 3 * pC.y + pD.y) * t3
        );

        if (segment === 0 && t === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
    }

    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const guideColor = isDark ? 'rgba(158, 155, 147, 0.72)' : 'rgba(61, 61, 61, 0.58)';
    const curveColor = isDark ? '#ededea' : '#0a0a0a';

    this.drawReferencePolyline(this.points, guideColor);

    if (this.curveType === 'bezier') {
      this.drawBezierCurve(curveColor);
    } else {
      this.drawInterpolationCurve(curveColor);
    }
  }
}

class FergusonVisualizer {
  constructor(container) {
    this.container = container;
    this.width = 640;
    this.height = 360;
    this.t = 0.5;

    this.points = {
      p0: { x: 92, y: 265 },
      p1: { x: 510, y: 95 },
      h0: { x: 235, y: 80 },
      h1: { x: 390, y: 285 }
    };

    this.activeHandle = null;
    this.presets = {
      classic: {
        label: 'Klasická S',
        points: {
          p0: { x: 92, y: 265 },
          p1: { x: 510, y: 95 },
          h0: { x: 235, y: 80 },
          h1: { x: 390, y: 285 }
        }
      },
      arc: {
        label: 'Jemný oblúk',
        points: {
          p0: { x: 96, y: 252 },
          p1: { x: 510, y: 252 },
          h0: { x: 225, y: 74 },
          h1: { x: 385, y: 74 }
        }
      },
      line: {
        label: 'Takmer úsečka',
        points: {
          p0: { x: 100, y: 250 },
          p1: { x: 510, y: 110 },
          h0: { x: 245, y: 204 },
          h1: { x: 375, y: 156 }
        }
      }
    };

    this.handlePointerMove = (event) => this.drag(event);
    this.handlePointerUp = () => this.dragEnd();
    this.handleThemeChange = (mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === 'data-theme')) {
        this.draw();
      }
    };

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="ferguson-stage">
        <div class="ferguson-head">
          <p class="ferguson-kicker">Fergusonova kubika</p>
          <p class="ferguson-hint">Potiahni krajné body alebo konce dotykových vektorov. Krivka vždy prejde cez P0 a P1, vektory T0 a T1 určujú smer v krajoch.</p>
        </div>
        <div class="ferguson-canvas-wrap" style="--ferguson-aspect: ${this.width} / ${this.height};">
          <canvas class="ferguson-canvas" width="${this.width}" height="${this.height}"></canvas>
        </div>
        <div class="ferguson-readout"></div>
      </div>
      <div class="ferguson-panel">
        <div class="ferguson-card">
          <p class="ferguson-card-title">Parameter</p>
          <label class="ferguson-slider-row">
            <span>t</span>
            <input class="ferguson-slider" type="range" min="0" max="1" step="0.01" value="${this.t}">
            <strong class="ferguson-t-value">${this.t.toFixed(2)}</strong>
          </label>
        </div>
        <div class="ferguson-card">
          <p class="ferguson-card-title">Tvar</p>
          <div class="ferguson-presets"></div>
        </div>
        <div class="ferguson-card">
          <p class="ferguson-card-title">Jadro</p>
          <p class="ferguson-summary">Kubika je daná bodmi P0, P1 a dotykovými vektormi T0, T1. Body sú interpolované, vektory hovoria, akým smerom má krivka z bodu vychádzať a do bodu prichádzať.</p>
          <code class="ferguson-formula">p(t) = h00 P0 + h10 T0 + h01 P1 + h11 T1</code>
        </div>
        <div class="ferguson-card">
          <p class="ferguson-card-title">Hodnoty</p>
          <div class="ferguson-values"></div>
        </div>
      </div>
    `;

    this.drawArea = this.container.querySelector('.ferguson-canvas-wrap');
    this.canvas = this.container.querySelector('.ferguson-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.readoutEl = this.container.querySelector('.ferguson-readout');
    this.slider = this.container.querySelector('.ferguson-slider');
    this.tValueEl = this.container.querySelector('.ferguson-t-value');
    this.presetsEl = this.container.querySelector('.ferguson-presets');
    this.valuesEl = this.container.querySelector('.ferguson-values');

    this.handleElements = {};
    [
      ['p0', 'P0', 'anchor'],
      ['p1', 'P1', 'anchor'],
      ['h0', 'T0', 'tangent'],
      ['h1', 'T1', 'tangent']
    ].forEach(([key, label, kind]) => {
      const element = document.createElement('div');
      element.className = `ferguson-handle is-${kind}`;
      element.dataset.label = label;
      element.dataset.key = key;
      element.addEventListener('pointerdown', (event) => this.dragStart(event, key));
      this.drawArea.appendChild(element);
      this.handleElements[key] = element;
    });

    this.presetsEl.innerHTML = Object.entries(this.presets)
      .map(([key, preset]) => `<button class="ferguson-preset-btn" type="button" data-preset="${key}">${preset.label}</button>`)
      .join('');

    this.presetsEl.querySelectorAll('.ferguson-preset-btn').forEach((button) => {
      button.addEventListener('click', () => this.applyPreset(button.dataset.preset));
    });

    this.slider.addEventListener('input', () => {
      this.t = Number(this.slider.value);
      this.draw();
      this.renderInfo();
    });

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);

    this.themeObserver = new MutationObserver(this.handleThemeChange);
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    this.applyPreset('classic');
  }

  applyPreset(key) {
    const preset = this.presets[key];
    if (!preset) return;

    this.points = Object.fromEntries(
      Object.entries(preset.points).map(([pointKey, point]) => [pointKey, { ...point }])
    );

    this.presetsEl.querySelectorAll('.ferguson-preset-btn').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.preset === key);
    });

    this.render();
  }

  getVector(key) {
    const anchor = key === 't0' ? this.points.p0 : this.points.p1;
    const handle = key === 't0' ? this.points.h0 : this.points.h1;
    return {
      x: handle.x - anchor.x,
      y: handle.y - anchor.y
    };
  }

  getPointAt(t) {
    const p0 = this.points.p0;
    const p1 = this.points.p1;
    const t0 = this.getVector('t0');
    const t1 = this.getVector('t1');
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return {
      x: h00 * p0.x + h10 * t0.x + h01 * p1.x + h11 * t1.x,
      y: h00 * p0.y + h10 * t0.y + h01 * p1.y + h11 * t1.y
    };
  }

  updateHandlePosition(key) {
    const point = this.points[key];
    const element = this.handleElements[key];
    element.style.left = `${(point.x / this.width) * 100}%`;
    element.style.top = `${(point.y / this.height) * 100}%`;
  }

  dragStart(event, key) {
    event.preventDefault();
    this.activeHandle = key;
    this.handleElements[key].classList.add('is-dragging');
  }

  drag(event) {
    if (!this.activeHandle) return;

    const rect = this.drawArea.getBoundingClientRect();
    const previous = { ...this.points[this.activeHandle] };
    let x = ((event.clientX - rect.left) / rect.width) * this.width;
    let y = ((event.clientY - rect.top) / rect.height) * this.height;

    x = Math.max(0, Math.min(this.width, x));
    y = Math.max(0, Math.min(this.height, y));

    this.points[this.activeHandle].x = x;
    this.points[this.activeHandle].y = y;

    if (this.activeHandle === 'p0') {
      this.points.h0.x += x - previous.x;
      this.points.h0.y += y - previous.y;
    }

    if (this.activeHandle === 'p1') {
      this.points.h1.x += x - previous.x;
      this.points.h1.y += y - previous.y;
    }

    this.render();
  }

  dragEnd() {
    if (!this.activeHandle) return;
    this.handleElements[this.activeHandle].classList.remove('is-dragging');
    this.activeHandle = null;
  }

  drawGrid() {
    this.ctx.strokeStyle = this.themeColors().grid;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    for (let x = 0; x <= this.width; x += 40) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }

    for (let y = 0; y <= this.height; y += 40) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }

    this.ctx.stroke();
  }

  themeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      grid: isDark ? 'rgba(148, 163, 184, 0.11)' : 'rgba(15, 23, 42, 0.08)',
      tangent: isDark ? 'rgba(245, 158, 11, 0.9)' : 'rgba(217, 119, 6, 0.9)',
      tangentSoft: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(217, 119, 6, 0.14)',
      curve: isDark ? '#ededea' : '#0a0a0a',
      marker: '#ef4444'
    };
  }

  drawTangent(anchor, handle, colors) {
    this.ctx.strokeStyle = colors.tangent;
    this.ctx.fillStyle = colors.tangentSoft;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([7, 6]);
    this.ctx.beginPath();
    this.ctx.moveTo(anchor.x, anchor.y);
    this.ctx.lineTo(handle.x, handle.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawCurve(colors) {
    this.ctx.strokeStyle = colors.curve;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();

    for (let step = 0; step <= 120; step += 1) {
      const t = step / 120;
      const point = this.getPointAt(t);
      if (step === 0) this.ctx.moveTo(point.x, point.y);
      else this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.stroke();
  }

  drawMarker(colors) {
    const point = this.getPointAt(this.t);
    this.ctx.fillStyle = colors.marker;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
  }

  draw() {
    const colors = this.themeColors();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
    this.drawTangent(this.points.p0, this.points.h0, colors);
    this.drawTangent(this.points.p1, this.points.h1, colors);
    this.drawCurve(colors);
    this.drawMarker(colors);
  }

  renderInfo() {
    const current = this.getPointAt(this.t);
    const t0 = this.getVector('t0');
    const t1 = this.getVector('t1');
    const lengthT0 = Math.hypot(t0.x, t0.y);
    const lengthT1 = Math.hypot(t1.x, t1.y);

    this.tValueEl.textContent = this.t.toFixed(2);
    this.readoutEl.textContent = `Aktuálny bod p(${this.t.toFixed(2)}) = (${Math.round(current.x)}, ${Math.round(current.y)}). Pri t = 0 je to presne P0, pri t = 1 presne P1.`;
    this.valuesEl.innerHTML = `
      <div class="ferguson-value-row"><span>P0</span><strong>(${Math.round(this.points.p0.x)}, ${Math.round(this.points.p0.y)})</strong></div>
      <div class="ferguson-value-row"><span>P1</span><strong>(${Math.round(this.points.p1.x)}, ${Math.round(this.points.p1.y)})</strong></div>
      <div class="ferguson-value-row"><span>|T0|</span><strong>${Math.round(lengthT0)}</strong></div>
      <div class="ferguson-value-row"><span>|T1|</span><strong>${Math.round(lengthT1)}</strong></div>
    `;
  }

  render() {
    Object.keys(this.handleElements).forEach((key) => this.updateHandlePosition(key));
    this.draw();
    this.renderInfo();
  }
}

function initBezierVisualizers() {
  const containers = document.querySelectorAll('.bezier-visualizer');
  containers.forEach((container) => {
    if (!container.hasAttribute('data-initialized')) {
      new BezierVisualizer(container);
      container.setAttribute('data-initialized', 'true');
    }
  });
}

function initFergusonVisualizers() {
  const containers = document.querySelectorAll('.ferguson-visualizer');
  containers.forEach((container) => {
    if (!container.hasAttribute('data-initialized')) {
      new FergusonVisualizer(container);
      container.setAttribute('data-initialized', 'true');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const proseEl = document.querySelector('.prose') || document.body;
  const bezierObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue;
      const bezierContainers = document.querySelectorAll('.bezier-visualizer:not([data-initialized])');
      const fergusonContainers = document.querySelectorAll('.ferguson-visualizer:not([data-initialized])');
      if (bezierContainers.length > 0) initBezierVisualizers();
      if (fergusonContainers.length > 0) initFergusonVisualizers();
    }
  });

  bezierObserver.observe(proseEl, { childList: true, subtree: true });
  initBezierVisualizers();
  initFergusonVisualizers();
});
