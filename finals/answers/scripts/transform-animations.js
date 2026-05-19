class TransformVisualizer {
  constructor(container) {
    this.container = container;
    this.width = 420;
    this.height = 420;

    // Define initial shape (a house or letter F, let's do a house)
    this.originalShape = [
      { x: -50, y: 50 },   // Bottom left
      { x: 50, y: 50 },    // Bottom right
      { x: 50, y: -20 },   // Top right wall
      { x: 0, y: -70 },    // Roof peak
      { x: -50, y: -20 },  // Top left wall
      { x: -50, y: 50 }    // Back to bottom left to close
    ];

    // State
    this.tx = 0;
    this.ty = 0;
    this.sx = 1;
    this.sy = 1;
    this.rot = 0; // degrees
    this.shx = 0;
    this.shy = 0;

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="transform-canvas-wrapper">
        <canvas class="transform-canvas" width="${this.width}" height="${this.height}"></canvas>
        <div class="transform-status">Mriežka má stred v bode (0,0). Výsledná matica je T · R · Sh · S, takže pri stĺpcových vektoroch sa aplikuje sprava doľava: mierka, skosenie, rotácia, posunutie.</div>
        <div class="transform-group transform-group--matrix">
          <p class="transform-group-title">Výsledná transformačná matica</p>
          <div class="transform-matrix" id="tr-matrix">
            [1.00, 0.00, 0.00]<br>
            [0.00, 1.00, 0.00]<br>
            [0.00, 0.00, 1.00]
          </div>
          <button class="transform-btn" id="tr-reset">Resetovať všetky</button>
        </div>
      </div>
      <div class="transform-controls">
        
        <div class="transform-group">
          <p class="transform-group-title">Posunutie</p>
          <div class="transform-slider-row">
            <label>X</label>
            <input type="range" id="tr-tx" min="-150" max="150" value="0" step="10">
            <span id="val-tx">0 px</span>
          </div>
          <div class="transform-slider-row">
            <label>Y</label>
            <input type="range" id="tr-ty" min="-150" max="150" value="0" step="10">
            <span id="val-ty">0 px</span>
          </div>
        </div>

        <div class="transform-group">
          <p class="transform-group-title">Zmena mierky</p>
          <div class="transform-slider-row">
            <label>kx</label>
            <input type="range" id="tr-sx" min="-3" max="3" value="1" step="0.1">
            <span id="val-sx">1.0 x</span>
          </div>
          <div class="transform-slider-row">
            <label>ky</label>
            <input type="range" id="tr-sy" min="-3" max="3" value="1" step="0.1">
            <span id="val-sy">1.0 x</span>
          </div>
        </div>

        <div class="transform-group">
          <p class="transform-group-title">Rotácia</p>
          <div class="transform-slider-row">
            <label>°</label>
            <input type="range" id="tr-rot" min="-180" max="180" value="0" step="1">
            <span id="val-rot">0 °</span>
          </div>
        </div>

        <div class="transform-group">
          <p class="transform-group-title">Skosenie</p>
          <div class="transform-slider-row">
            <label>Sx</label>
            <input type="range" id="tr-shx" min="-2" max="2" value="0" step="0.1">
            <span id="val-shx">0.0</span>
          </div>
          <div class="transform-slider-row">
            <label>Sy</label>
            <input type="range" id="tr-shy" min="-2" max="2" value="0" step="0.1">
            <span id="val-shy">0.0</span>
          </div>
        </div>

      </div>
    `;

    this.canvas = this.container.querySelector('.transform-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Controls mapping
    this.controls = {
      tx: { el: this.container.querySelector('#tr-tx'), valEl: this.container.querySelector('#val-tx'), unit: ' px' },
      ty: { el: this.container.querySelector('#tr-ty'), valEl: this.container.querySelector('#val-ty'), unit: ' px' },
      sx: { el: this.container.querySelector('#tr-sx'), valEl: this.container.querySelector('#val-sx'), unit: ' x' },
      sy: { el: this.container.querySelector('#tr-sy'), valEl: this.container.querySelector('#val-sy'), unit: ' x' },
      rot: { el: this.container.querySelector('#tr-rot'), valEl: this.container.querySelector('#val-rot'), unit: ' °' },
      shx: { el: this.container.querySelector('#tr-shx'), valEl: this.container.querySelector('#val-shx'), unit: '' },
      shy: { el: this.container.querySelector('#tr-shy'), valEl: this.container.querySelector('#val-shy'), unit: '' }
    };

    this.matrixEl = this.container.querySelector('#tr-matrix');
    this.resetBtn = this.container.querySelector('#tr-reset');

    // Bind events
    Object.keys(this.controls).forEach(key => {
      this.controls[key].el.addEventListener('input', (e) => {
        this[key] = parseFloat(e.target.value);
        let displayVal = this[key];
        if (key === 'sx' || key === 'sy' || key === 'shx' || key === 'shy') {
          displayVal = displayVal.toFixed(1);
        }
        this.controls[key].valEl.innerText = displayVal + this.controls[key].unit;
        this.update();
      });
    });

    this.resetBtn.addEventListener('click', () => {
      this.tx = 0; this.ty = 0;
      this.sx = 1; this.sy = 1;
      this.rot = 0;
      this.shx = 0; this.shy = 0;

      Object.keys(this.controls).forEach(key => {
        this.controls[key].el.value = this[key];
        let displayVal = this[key];
        if (key === 'sx' || key === 'sy' || key === 'shx' || key === 'shy') {
          displayVal = displayVal.toFixed(1);
        }
        this.controls[key].valEl.innerText = displayVal + this.controls[key].unit;
      });

      this.update();
    });

    this.update();
  }

  // Multiply two 3x3 matrices
  multiplyMatrix(a, b) {
    let result = [
      [0,0,0],
      [0,0,0],
      [0,0,0]
    ];
    for(let r=0; r<3; r++) {
      for(let c=0; c<3; c++) {
        result[r][c] = a[r][0]*b[0][c] + a[r][1]*b[1][c] + a[r][2]*b[2][c];
      }
    }
    return result;
  }

  update() {
    // 1. Identity
    let M = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    // Build transformation matrices
    // NOTE: Order of multiplication matters! 
    // Typical local transformation order: Scale -> Shear -> Rotate -> Translate

    // Scale
    let S = [
      [this.sx, 0, 0],
      [0, this.sy, 0],
      [0, 0, 1]
    ];
    
    // Shear
    let Sh = [
      [1, this.shx, 0],
      [this.shy, 1, 0],
      [0, 0, 1]
    ];

    // Rotate
    let rad = this.rot * Math.PI / 180;
    let R = [
      [Math.cos(rad), -Math.sin(rad), 0],
      [Math.sin(rad), Math.cos(rad), 0],
      [0, 0, 1]
    ];

    // Translate (remember canvas Y is down, but we treat Y as standard up then invert for drawing)
    let T = [
      [1, 0, this.tx],
      [0, 1, -this.ty], // Invert Y visually so positive Y moves up
      [0, 0, 1]
    ];

    // Compute final matrix M = T * R * Sh * S
    M = this.multiplyMatrix(M, T);
    M = this.multiplyMatrix(M, R);
    M = this.multiplyMatrix(M, Sh);
    M = this.multiplyMatrix(M, S);

    // Update Matrix UI
    this.matrixEl.innerHTML = `
      [${M[0][0].toFixed(2)}, ${M[0][1].toFixed(2)}, ${M[0][2].toFixed(0)}]<br>
      [${M[1][0].toFixed(2)}, ${M[1][1].toFixed(2)}, ${(-M[1][2]).toFixed(0)}]<br>
      [${M[2][0].toFixed(2)}, ${M[2][1].toFixed(2)}, ${M[2][2].toFixed(2)}]
    `;

    // Draw
    this.draw(M);
  }

  draw(M) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const axisColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
    const originalColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const transformedColor = '#ef4444'; // Red
    const transformedFill = isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)';

    // Draw Axes
    this.ctx.beginPath();
    this.ctx.moveTo(0, cy);
    this.ctx.lineTo(this.width, cy);
    this.ctx.moveTo(cx, 0);
    this.ctx.lineTo(cx, this.height);
    this.ctx.strokeStyle = axisColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Helper function to draw a shape
    const drawShape = (shape, matrix, stroke, fill, width, dashed=false) => {
      this.ctx.beginPath();
      for (let i = 0; i < shape.length; i++) {
        const pt = shape[i];
        
        let tx = pt.x;
        let ty = pt.y;

        if (matrix) {
          // Multiply point [x, y, 1] by matrix M
          tx = matrix[0][0] * pt.x + matrix[0][1] * pt.y + matrix[0][2];
          ty = matrix[1][0] * pt.x + matrix[1][1] * pt.y + matrix[1][2];
        }

        // Map to canvas coords
        let canvasX = cx + tx;
        let canvasY = cy + ty; // No need to invert here, inverted in Translation matrix

        if (i === 0) this.ctx.moveTo(canvasX, canvasY);
        else this.ctx.lineTo(canvasX, canvasY);
      }
      this.ctx.fillStyle = fill;
      this.ctx.fill();
      
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = width;
      if (dashed) this.ctx.setLineDash([5, 5]);
      else this.ctx.setLineDash([]);
      this.ctx.stroke();
    };

    // Draw Original Shape (ghosted)
    drawShape(this.originalShape, null, originalColor, 'transparent', 2, true);

    // Draw Transformed Shape
    drawShape(this.originalShape, M, transformedColor, transformedFill, 3, false);
  }
}

function initTransformVisualizers() {
  const containers = document.querySelectorAll('.transform-visualizer');
  containers.forEach(container => {
    if (!container.hasAttribute('data-initialized')) {
      new TransformVisualizer(container);
      container.setAttribute('data-initialized', 'true');
    }
  });
}

// Hook into DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const proseEl = document.querySelector('.prose') || document.body;
  const transformObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type === 'childList') {
        const containers = document.querySelectorAll('.transform-visualizer:not([data-initialized])');
        if (containers.length > 0) {
          initTransformVisualizers();
        }
      }
    }
  });
  transformObserver.observe(proseEl, { childList: true, subtree: true });
  initTransformVisualizers();
});
