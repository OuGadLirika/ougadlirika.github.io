function clampColorValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapHue(value) {
  return ((value % 360) + 360) % 360;
}

function hslToRgb(h, s, l) {
  const hue = wrapHue(h) / 360;
  const saturation = clampColorValue(s, 0, 100) / 100;
  const lightness = clampColorValue(l, 0, 100) / 100;

  if (saturation === 0) {
    const gray = Math.round(lightness * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hueToRgb = (p, q, t) => {
    let channel = t;
    if (channel < 0) channel += 1;
    if (channel > 1) channel -= 1;
    if (channel < 1 / 6) return p + (q - p) * 6 * channel;
    if (channel < 1 / 2) return q;
    if (channel < 2 / 3) return p + (q - p) * (2 / 3 - channel) * 6;
    return p;
  };

  const q = lightness < 0.5
    ? lightness * (1 + saturation)
    : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hue) * 255),
    b: Math.round(hueToRgb(p, q, hue - 1 / 3) * 255)
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => value.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToCmyk({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const key = 1 - Math.max(red, green, blue);

  if (key === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  return {
    c: Math.round(((1 - red - key) / (1 - key)) * 100),
    m: Math.round(((1 - green - key) / (1 - key)) * 100),
    y: Math.round(((1 - blue - key) / (1 - key)) * 100),
    k: Math.round(key * 100)
  };
}

function rgbToXyz({ r, g, b }) {
  const linearize = (value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  };

  const red = linearize(r);
  const green = linearize(g);
  const blue = linearize(b);

  return {
    x: (red * 0.4124 + green * 0.3576 + blue * 0.1805) * 100,
    y: (red * 0.2126 + green * 0.7152 + blue * 0.0722) * 100,
    z: (red * 0.0193 + green * 0.1192 + blue * 0.9505) * 100
  };
}

class ColorVisualizer {
  constructor(container) {
    this.container = container;
    this.width = 700;
    this.height = 420;

    this.mode = 'sampling';
    this.scheme = 'complement';
    this.sampleCount = 20;
    this.detail = 8;
    this.bits = 5;

    this.hue = 205;
    this.saturation = 78;
    this.lightness = 52;

    this.handleThemeChange = (mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === 'data-theme')) {
        this.render();
      }
    };

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="color-stage">
        <div class="color-stage-head">
          <p class="color-kicker" id="color-kicker">Digitalizácia obrazu</p>
          <p class="color-hint" id="color-hint">Meníš hustotu vzoriek a bitovú hĺbku. Hore je spojitý farebný priebeh, dole jeho digitálny prepis po vzorkovaní a kvantizácii.</p>
        </div>
        <div class="color-stage-screen">
          <canvas class="color-canvas" width="${this.width}" height="${this.height}"></canvas>
          <div class="color-model-board" hidden>
            <div class="color-swatch-grid">
              <div class="color-swatch-card">
                <div class="color-swatch" id="color-rgb-swatch"></div>
                <div class="color-swatch-meta">
                  <span class="color-swatch-label">Aditívne skladanie</span>
                  <span class="color-swatch-value" id="color-rgb-value"></span>
                </div>
              </div>
              <div class="color-swatch-card">
                <div class="color-swatch" id="color-print-swatch"></div>
                <div class="color-swatch-meta">
                  <span class="color-swatch-label">Subtraktívna simulácia</span>
                  <span class="color-swatch-value" id="color-print-value"></span>
                </div>
              </div>
            </div>
            <div class="color-palette" id="color-palette"></div>
            <div class="color-gamut-list" id="color-gamut-list"></div>
          </div>
        </div>
        <div class="color-stage-foot">
          <div class="color-status" id="color-status"></div>
        </div>
      </div>
      <div class="color-panel">
        <div class="color-card">
          <p class="color-card-title">Režim laboratória</p>
          <div class="color-mode-switch">
            <button class="color-mode-btn" data-mode="sampling" type="button">Digitalizácia</button>
            <button class="color-mode-btn" data-mode="models" type="button">Farby a gamut</button>
          </div>
        </div>
        <div class="color-card" id="color-sampling-card">
          <p class="color-card-title">Vzorkovanie a kvantizácia</p>
          <div class="color-slider-row">
            <label for="color-samples">Vzorky</label>
            <input type="range" id="color-samples" min="8" max="48" step="2" value="${this.sampleCount}">
            <span id="color-samples-value"></span>
          </div>
          <div class="color-slider-row">
            <label for="color-detail">Detail</label>
            <input type="range" id="color-detail" min="2" max="16" step="1" value="${this.detail}">
            <span id="color-detail-value"></span>
          </div>
          <div class="color-slider-row">
            <label for="color-bits">Bitová hĺbka</label>
            <input type="range" id="color-bits" min="2" max="8" step="1" value="${this.bits}">
            <span id="color-bits-value"></span>
          </div>
          <div class="color-stat-stack" id="color-sampling-stats"></div>
        </div>
        <div class="color-card" id="color-model-card" hidden>
          <p class="color-card-title">Farebný model</p>
          <div class="color-slider-row">
            <label for="color-hue">Tón</label>
            <input type="range" id="color-hue" min="0" max="359" step="1" value="${this.hue}">
            <span id="color-hue-value"></span>
          </div>
          <div class="color-slider-row">
            <label for="color-saturation">Sýtosť</label>
            <input type="range" id="color-saturation" min="0" max="100" step="1" value="${this.saturation}">
            <span id="color-saturation-value"></span>
          </div>
          <div class="color-slider-row">
            <label for="color-lightness">Svetelnosť</label>
            <input type="range" id="color-lightness" min="0" max="100" step="1" value="${this.lightness}">
            <span id="color-lightness-value"></span>
          </div>
          <div class="color-scheme-switch" id="color-scheme-switch"></div>
        </div>
        <div class="color-card">
          <p class="color-card-title">Prepočty modelov</p>
          <div class="color-stat-stack" id="color-conversion-stats"></div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.color-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.modelBoard = this.container.querySelector('.color-model-board');
    this.statusEl = this.container.querySelector('#color-status');
    this.kickerEl = this.container.querySelector('#color-kicker');
    this.hintEl = this.container.querySelector('#color-hint');

    this.modeButtons = Array.from(this.container.querySelectorAll('.color-mode-btn'));
    this.modeButtons.forEach((button) => {
      button.addEventListener('click', () => this.setMode(button.dataset.mode));
    });

    this.samplingCard = this.container.querySelector('#color-sampling-card');
    this.modelCard = this.container.querySelector('#color-model-card');
    this.samplingStatsEl = this.container.querySelector('#color-sampling-stats');
    this.conversionStatsEl = this.container.querySelector('#color-conversion-stats');

    this.rgbSwatchEl = this.container.querySelector('#color-rgb-swatch');
    this.rgbValueEl = this.container.querySelector('#color-rgb-value');
    this.printSwatchEl = this.container.querySelector('#color-print-swatch');
    this.printValueEl = this.container.querySelector('#color-print-value');
    this.paletteEl = this.container.querySelector('#color-palette');
    this.gamutListEl = this.container.querySelector('#color-gamut-list');
    this.schemeSwitchEl = this.container.querySelector('#color-scheme-switch');

    this.controls = {
      sampleCount: {
        input: this.container.querySelector('#color-samples'),
        value: this.container.querySelector('#color-samples-value'),
        format: (current) => `${current} vz.`,
      },
      detail: {
        input: this.container.querySelector('#color-detail'),
        value: this.container.querySelector('#color-detail-value'),
        format: (current) => `${current}×`,
      },
      bits: {
        input: this.container.querySelector('#color-bits'),
        value: this.container.querySelector('#color-bits-value'),
        format: (current) => `${current} bit`,
      },
      hue: {
        input: this.container.querySelector('#color-hue'),
        value: this.container.querySelector('#color-hue-value'),
        format: (current) => `${current}°`,
      },
      saturation: {
        input: this.container.querySelector('#color-saturation'),
        value: this.container.querySelector('#color-saturation-value'),
        format: (current) => `${current} %`,
      },
      lightness: {
        input: this.container.querySelector('#color-lightness'),
        value: this.container.querySelector('#color-lightness-value'),
        format: (current) => `${current} %`,
      }
    };

    Object.entries(this.controls).forEach(([key, control]) => {
      control.input.addEventListener('input', (event) => {
        this[key] = Number(event.target.value);
        this.render();
      });
    });

    this.schemeOptions = [
      { id: 'monochrome', label: 'Monochrom.' },
      { id: 'analog', label: 'Analogická' },
      { id: 'complement', label: 'Komplement.' },
      { id: 'triad', label: 'Triadická' },
      { id: 'tetrad', label: 'Tetradická' },
      { id: 'splitComplement', label: 'Split-kompl.' }
    ];

    this.themeObserver = new MutationObserver(this.handleThemeChange);
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    this.renderSchemeButtons();
    this.render();
  }

  setMode(mode) {
    this.mode = mode;
    this.render();
  }

  setScheme(scheme) {
    this.scheme = scheme;
    this.render();
  }

  isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  getSamplingDiagnostics() {
    const signalCycles = 1.4 + this.detail * 0.68;
    const samplesPerCycle = this.sampleCount / signalCycles;
    let aliasLabel = 'Bezpečne nad Nyquistom';
    let aliasState = 'is-ok';

    if (samplesPerCycle < 2.2) {
      aliasLabel = 'Aliasovanie je pravdepodobné';
      aliasState = 'is-warn';
    } else if (samplesPerCycle < 3.4) {
      aliasLabel = 'Sme na hrane detailu';
      aliasState = 'is-soft';
    }

    let bandingLabel = 'Prechod bude hladký';
    if (this.bits <= 3) {
      bandingLabel = 'Banding bude veľmi viditeľný';
    } else if (this.bits <= 5) {
      bandingLabel = 'Mierny banding v jemných prechodoch';
    }

    return {
      signalCycles,
      samplesPerCycle,
      aliasLabel,
      aliasState,
      bandingLabel
    };
  }

  getSignalColor(t) {
    const frequency = 0.8 + this.detail * 0.18;
    const angle = t * Math.PI * 2;
    const red = 0.5 + 0.5 * Math.sin(angle * frequency + 0.3);
    const green = 0.5 + 0.5 * Math.sin(angle * (frequency + 0.9) + 2.1);
    const blue = 0.5 + 0.5 * Math.sin(angle * (frequency + 1.7) + 4.4);

    return {
      r: Math.round(red * 255),
      g: Math.round(green * 255),
      b: Math.round(blue * 255)
    };
  }

  quantizeChannel(value) {
    const levels = (2 ** this.bits) - 1;
    return Math.round((Math.round((value / 255) * levels) / levels) * 255);
  }

  quantizeColor(color) {
    return {
      r: this.quantizeChannel(color.r),
      g: this.quantizeChannel(color.g),
      b: this.quantizeChannel(color.b)
    };
  }

  getSelectedRgb() {
    return hslToRgb(this.hue, this.saturation, this.lightness);
  }

  getPrintPreview(rgb) {
    const subdued = {
      h: this.hue,
      s: Math.max(0, Math.round(this.saturation * 0.72)),
      l: clampColorValue(Math.round(this.lightness * 0.93), 6, 92)
    };
    return hslToRgb(subdued.h, subdued.s, subdued.l);
  }

  getSchemePalette() {
    const baseHue = this.hue;
    const baseSaturation = this.saturation;
    const baseLightness = this.lightness;

    const palette = {
      monochrome: [
        { label: 'Tieň', h: baseHue, s: Math.max(20, baseSaturation - 28), l: Math.max(18, baseLightness - 24) },
        { label: 'Základ', h: baseHue, s: baseSaturation, l: baseLightness },
        { label: 'Mäkký', h: baseHue, s: Math.max(16, baseSaturation - 16), l: clampColorValue(baseLightness + 14, 0, 90) },
        { label: 'Svetlo', h: baseHue, s: Math.max(10, baseSaturation - 34), l: clampColorValue(baseLightness + 28, 0, 94) }
      ],
      analog: [
        { label: '-30°', h: baseHue - 30, s: baseSaturation, l: clampColorValue(baseLightness - 4, 0, 100) },
        { label: 'Základ', h: baseHue, s: baseSaturation, l: baseLightness },
        { label: '+30°', h: baseHue + 30, s: Math.max(20, baseSaturation - 4), l: clampColorValue(baseLightness + 2, 0, 100) },
        { label: '+60°', h: baseHue + 60, s: Math.max(25, baseSaturation - 12), l: clampColorValue(baseLightness + 6, 0, 100) }
      ],
      complement: [
        { label: 'Základ', h: baseHue, s: baseSaturation, l: baseLightness },
        { label: 'Akcent', h: baseHue + 18, s: Math.max(28, baseSaturation - 18), l: clampColorValue(baseLightness + 8, 0, 100) },
        { label: 'Komplement', h: baseHue + 180, s: baseSaturation, l: baseLightness },
        { label: 'Tlmený', h: baseHue + 180, s: Math.max(22, baseSaturation - 26), l: clampColorValue(baseLightness + 10, 0, 100) }
      ],
      triad: [
        { label: 'A', h: baseHue, s: baseSaturation, l: baseLightness },
        { label: 'B', h: baseHue + 120, s: Math.max(26, baseSaturation - 6), l: clampColorValue(baseLightness + 4, 0, 100) },
        { label: 'C', h: baseHue + 240, s: Math.max(24, baseSaturation - 2), l: clampColorValue(baseLightness - 2, 0, 100) },
        { label: 'Akcent', h: baseHue + 60, s: Math.max(30, baseSaturation - 18), l: clampColorValue(baseLightness + 12, 0, 100) }
      ],
      tetrad: [
        { label: 'A', h: baseHue, s: baseSaturation, l: baseLightness },
        { label: 'B', h: baseHue + 60, s: Math.max(24, baseSaturation - 6), l: clampColorValue(baseLightness + 4, 0, 100) },
        { label: 'C', h: baseHue + 180, s: Math.max(26, baseSaturation - 10), l: clampColorValue(baseLightness - 2, 0, 100) },
        { label: 'D', h: baseHue + 240, s: Math.max(22, baseSaturation - 12), l: clampColorValue(baseLightness + 6, 0, 100) }
      ],
      splitComplement: [
        { label: 'Základ', h: baseHue, s: baseSaturation, l: baseLightness },
        { label: '-150°', h: baseHue + 150, s: Math.max(28, baseSaturation - 6), l: clampColorValue(baseLightness + 4, 0, 100) },
        { label: '+150°', h: baseHue + 210, s: Math.max(28, baseSaturation - 8), l: clampColorValue(baseLightness - 2, 0, 100) },
        { label: 'Tlmený', h: baseHue, s: Math.max(18, baseSaturation - 32), l: clampColorValue(baseLightness + 18, 0, 94) }
      ]
    };

    return palette[this.scheme].map((entry) => ({
      ...entry,
      rgb: hslToRgb(entry.h, entry.s, entry.l)
    }));
  }

  getGamutRows() {
    const hue = wrapHue(this.hue);
    const saturation = this.saturation;
    const lightness = this.lightness;
    const printRisk = saturation > 84 && ((hue >= 90 && hue <= 170) || (hue >= 280 && hue <= 345));

    return [
      {
        label: 'sRGB monitor',
        badge: saturation > 88 && lightness > 58 ? 'Na hrane' : 'V norme',
        state: saturation > 88 && lightness > 58 ? 'is-soft' : 'is-ok'
      },
      {
        label: 'DCI-P3 displej',
        badge: saturation > 72 ? 'Má rezervu' : 'Bez problému',
        state: 'is-ok'
      },
      {
        label: 'CMYK tlač',
        badge: printRisk ? 'Mimo gamutu' : saturation > 68 ? 'Kompresia' : 'Blízko originálu',
        state: printRisk ? 'is-warn' : saturation > 68 ? 'is-soft' : 'is-ok'
      }
    ];
  }

  getModeCopy() {
    if (this.mode === 'sampling') {
      return {
        kicker: 'Digitalizácia obrazu',
        hint: 'Meníš hustotu vzoriek a bitovú hĺbku. Hore je spojitý farebný priebeh, dole jeho digitálny prepis po vzorkovaní a kvantizácii.'
      };
    }

    return {
      kicker: 'Farebné modely a gamut',
      hint: 'Miešaš tón, sýtosť a svetelnosť v HSL. Vľavo vidíš aditívnu RGB farbu, simuláciu tlače, schému z farebného kruhu aj odhad správania v rôznych gamutových priestoroch.'
    };
  }

  renderSchemeButtons() {
    this.schemeSwitchEl.innerHTML = this.schemeOptions
      .map((option) => (
        `<button class="color-scheme-btn${this.scheme === option.id ? ' is-active' : ''}" data-scheme="${option.id}" type="button">${option.label}</button>`
      ))
      .join('');

    Array.from(this.schemeSwitchEl.querySelectorAll('.color-scheme-btn')).forEach((button) => {
      button.addEventListener('click', () => this.setScheme(button.dataset.scheme));
    });
  }

  renderSamplingCanvas() {
    const isDark = this.isDarkTheme();
    const background = isDark ? '#0f172a' : '#f8fafc';
    const frame = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(15, 23, 42, 0.14)';
    const text = isDark ? '#e5eefb' : '#102033';
    const muted = isDark ? 'rgba(226, 232, 240, 0.66)' : 'rgba(15, 23, 42, 0.56)';
    const wave = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15, 23, 42, 0.18)';

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const padding = 28;
    const innerWidth = this.width - padding * 2;
    const topY = 62;
    const blockHeight = 118;
    const bottomY = 238;
    const waveY = 205;
    const diagnostics = this.getSamplingDiagnostics();

    this.ctx.font = '600 15px var(--font-body)';
    this.ctx.fillStyle = text;
    this.ctx.fillText('Spojitý priebeh', padding, 32);
    this.ctx.fillText('Po vzorkovaní a kvantizácii', padding, 208);

    this.ctx.strokeStyle = frame;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(padding, topY, innerWidth, blockHeight);
    this.ctx.strokeRect(padding, bottomY, innerWidth, blockHeight);

    for (let x = 0; x < innerWidth; x += 1) {
      const t = x / (innerWidth - 1);
      const color = this.getSignalColor(t);
      this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      this.ctx.fillRect(padding + x, topY, 1, blockHeight);
    }

    const columnWidth = innerWidth / this.sampleCount;
    for (let index = 0; index < this.sampleCount; index += 1) {
      const startX = padding + index * columnWidth;
      const t = (index + 0.5) / this.sampleCount;
      const color = this.quantizeColor(this.getSignalColor(t));
      this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      this.ctx.fillRect(startX, bottomY, Math.ceil(columnWidth) + 1, blockHeight);
    }

    this.ctx.beginPath();
    for (let x = 0; x <= innerWidth; x += 3) {
      const t = x / innerWidth;
      const color = this.getSignalColor(t);
      const luminance = (color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722) / 255;
      const y = waveY - (luminance - 0.5) * 48;
      if (x === 0) {
        this.ctx.moveTo(padding + x, y);
      } else {
        this.ctx.lineTo(padding + x, y);
      }
    }
    this.ctx.strokeStyle = wave;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    for (let index = 0; index < this.sampleCount; index += 1) {
      const t = (index + 0.5) / this.sampleCount;
      const color = this.getSignalColor(t);
      const luminance = (color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722) / 255;
      const x = padding + (index + 0.5) * columnWidth;
      const y = waveY - (luminance - 0.5) * 48;
      this.ctx.fillStyle = `rgb(${this.quantizeChannel(color.r)}, ${this.quantizeChannel(color.g)}, ${this.quantizeChannel(color.b)})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = muted;
    this.ctx.font = '12px var(--font-mono)';
    this.ctx.fillText(`vzorky na periód. detailu: ${diagnostics.samplesPerCycle.toFixed(1)}`, padding, 392);
    this.ctx.fillText(`kanálové úrovne: ${2 ** this.bits}`, padding + 310, 392);
  }

  renderSamplingStats() {
    const diagnostics = this.getSamplingDiagnostics();
    const rows = [
      { label: 'Nyquistov odstup', value: diagnostics.aliasLabel },
      { label: 'Vzorky na cyklus', value: diagnostics.samplesPerCycle.toFixed(1) },
      { label: 'Úrovne na kanál', value: `${2 ** this.bits}` },
      { label: 'Kvantizačný efekt', value: diagnostics.bandingLabel }
    ];

    this.samplingStatsEl.innerHTML = rows
      .map((row) => (
        `<div class="color-stat-row">` +
          `<span class="color-stat-label">${row.label}</span>` +
          `<span class="color-stat-value">${row.value}</span>` +
        `</div>`
      ))
      .join('');
  }

  renderModelBoard() {
    const rgb = this.getSelectedRgb();
    const printRgb = this.getPrintPreview(rgb);
    const cmyk = rgbToCmyk(rgb);
    const palette = this.getSchemePalette();
    const gamutRows = this.getGamutRows();

    this.rgbSwatchEl.style.background = rgbToHex(rgb);
    this.rgbValueEl.textContent = `${rgbToHex(rgb)} • R ${rgb.r} / G ${rgb.g} / B ${rgb.b}`;

    this.printSwatchEl.style.background = rgbToHex(printRgb);
    this.printValueEl.textContent = `C ${cmyk.c} / M ${cmyk.m} / Y ${cmyk.y} / K ${cmyk.k} %`;

    this.paletteEl.innerHTML = palette
      .map((entry) => (
        `<div class="color-palette-chip">` +
          `<div class="color-palette-swatch" style="background:${rgbToHex(entry.rgb)}"></div>` +
          `<div class="color-palette-label">${entry.label}</div>` +
        `</div>`
      ))
      .join('');

    this.gamutListEl.innerHTML = gamutRows
      .map((row) => (
        `<div class="color-gamut-row">` +
          `<span class="color-gamut-label">${row.label}</span>` +
          `<span class="color-gamut-badge ${row.state}">${row.badge}</span>` +
        `</div>`
      ))
      .join('');
  }

  renderConversionStats() {
    const rgb = this.getSelectedRgb();
    const cmyk = rgbToCmyk(rgb);
    const xyz = rgbToXyz(rgb);
    const rows = [
      { label: 'RGB', value: `${rgb.r}, ${rgb.g}, ${rgb.b} (${rgbToHex(rgb)})` },
      { label: 'HSL', value: `${this.hue}° / ${this.saturation}% / ${this.lightness}%` },
      { label: 'CMYK', value: `${cmyk.c}% / ${cmyk.m}% / ${cmyk.y}% / ${cmyk.k}%` },
      { label: 'CIE XYZ', value: `${xyz.x.toFixed(1)} / ${xyz.y.toFixed(1)} / ${xyz.z.toFixed(1)}` }
    ];

    this.conversionStatsEl.innerHTML = rows
      .map((row) => (
        `<div class="color-stat-row">` +
          `<span class="color-stat-label">${row.label}</span>` +
          `<span class="color-stat-value">${row.value}</span>` +
        `</div>`
      ))
      .join('');
  }

  renderStatus() {
    if (this.mode === 'sampling') {
      const diagnostics = this.getSamplingDiagnostics();
      this.statusEl.textContent = diagnostics.samplesPerCycle < 2.2
        ? 'Vzorkovanie je príliš riedke vzhľadom na detail obrazu, preto sa začínajú objavovať aliasované falošné vzory. Zároveň nižšia bitová hĺbka rozseká prechody do viditeľných pásov.'
        : `Pri ${this.sampleCount} vzorkách a ${this.bits} bitoch na kanál je farebný priebeh ešte čitateľný. Ak znížiš hustotu vzoriek alebo bitovú hĺbku, najprv sa objaví aliasing a potom farebný banding.`;
      return;
    }

    const gamutRows = this.getGamutRows();
    const cmyk = rgbToCmyk(this.getSelectedRgb());
    const schemeLabels = {
      monochrome: 'monochromatická',
      analog: 'analogická',
      complement: 'komplementárna',
      triad: 'triadická',
      tetrad: 'tetradická',
      splitComplement: 'split-komplementárna'
    };
    const printLabels = {
      'Mimo gamutu': 'výraznú gamutovú kompresiu',
      'Kompresia': 'miernu gamutovú kompresiu',
      'Blízko originálu': 'len malý posun oproti monitoru'
    };

    this.statusEl.textContent = `Aktuálne skladáš farbu v HSL, ktorá sa na monitore zobrazuje aditívne cez RGB a pri tlači by sa previedla do CMYK (${cmyk.c}/${cmyk.m}/${cmyk.y}/${cmyk.k}). Zvolená schéma je ${schemeLabels[this.scheme]} a tlačový výstup si pri tejto farbe pravdepodobne vyžiada ${printLabels[gamutRows[2].badge]}.`;
  }

  render() {
    const modeCopy = this.getModeCopy();

    this.kickerEl.textContent = modeCopy.kicker;
    this.hintEl.textContent = modeCopy.hint;

    this.modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === this.mode);
    });

    this.samplingCard.hidden = this.mode !== 'sampling';
    this.modelCard.hidden = this.mode !== 'models';
    this.canvas.hidden = this.mode !== 'sampling';
    this.modelBoard.hidden = this.mode !== 'models';

    Object.entries(this.controls).forEach(([key, control]) => {
      control.value.textContent = control.format(this[key]);
    });

    this.renderSchemeButtons();
    this.renderSamplingStats();
    this.renderConversionStats();
    this.renderModelBoard();
    this.renderStatus();

    if (this.mode === 'sampling') {
      this.renderSamplingCanvas();
    }
  }
}

function initColorVisualizers() {
  const containers = document.querySelectorAll('.color-visualizer');
  containers.forEach((container) => {
    if (!container.hasAttribute('data-initialized')) {
      new ColorVisualizer(container);
      container.setAttribute('data-initialized', 'true');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const proseEl = document.querySelector('.prose') || document.body;
  const colorObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const containers = document.querySelectorAll('.color-visualizer:not([data-initialized])');
        if (containers.length > 0) {
          initColorVisualizers();
        }
      }
    }
  });

  colorObserver.observe(proseEl, { childList: true, subtree: true });
  initColorVisualizers();
});
