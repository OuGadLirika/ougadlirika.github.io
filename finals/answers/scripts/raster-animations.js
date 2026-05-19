class RasterVisualizer {
  constructor(container) {
    this.container = container;
    this.initDOM();
    
    // Grid settings
    this.cols = 50;
    this.rows = 36;
    
    // Points A and B (integer coordinates)
    this.pointA = { x: 6, y: 6 };
    this.pointB = { x: 42, y: 28 };
    
    // State
    this.mode = 'dda'; // 'dda', 'bresenham', 'diff'
    this.dragTarget = null;
    
    // Bind methods
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.resize = this.resize.bind(this);
    
    // Events
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    
    // Observers
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvasContainer);
    
    // Initial draw
    this.resize();
  }
  
  initDOM() {
    this.container.innerHTML = `
      <div class="raster-container">
        <div class="raster-header">
          <div class="raster-title">Rasterizácia úsečky</div>
          <div class="raster-controls">
            <button class="raster-btn is-active" data-mode="dda">DDA</button>
            <button class="raster-btn" data-mode="bresenham">Bresenham</button>
            <button class="raster-btn" data-mode="diff">Porovnanie</button>
          </div>
        </div>
        <div class="raster-canvas-container">
          <canvas class="raster-canvas"></canvas>
        </div>
        <div class="raster-legend">
          <div class="raster-legend-item" id="legend-dda" style="display: flex;">
            <div class="raster-legend-swatch" style="background: var(--raster-dda);"></div>
            <span>DDA</span>
          </div>
          <div class="raster-legend-item" id="legend-bresenham" style="display: none;">
            <div class="raster-legend-swatch" style="background: var(--raster-bresenham);"></div>
            <span>Bresenham</span>
          </div>
          <div class="raster-legend-item" id="legend-both" style="display: none;">
            <div class="raster-legend-swatch" style="background: var(--raster-both);"></div>
            <span>Prienik</span>
          </div>
        </div>
      </div>
    `;
    
    this.canvasContainer = this.container.querySelector('.raster-canvas-container');
    this.canvas = this.container.querySelector('.raster-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    const btns = this.container.querySelectorAll('.raster-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.mode = btn.getAttribute('data-mode');
        this.updateLegend();
        this.draw();
      });
    });
  }
  
  updateLegend() {
    const lDda = this.container.querySelector('#legend-dda');
    const lBresenham = this.container.querySelector('#legend-bresenham');
    const lBoth = this.container.querySelector('#legend-both');
    
    if (this.mode === 'dda') {
      lDda.style.display = 'flex';
      lBresenham.style.display = 'none';
      lBoth.style.display = 'none';
    } else if (this.mode === 'bresenham') {
      lDda.style.display = 'none';
      lBresenham.style.display = 'flex';
      lBoth.style.display = 'none';
    } else {
      lDda.style.display = 'flex';
      lBresenham.style.display = 'flex';
      lBoth.style.display = 'flex';
    }
  }
  
  resize() {
    const rect = this.canvasContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    
    this.cellW = this.width / this.cols;
    this.cellH = this.height / this.rows;
    
    this.draw();
  }
  
  getGridCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    return {
      x: Math.round((x - this.cellW/2) / this.cellW),
      y: Math.round((y - this.cellH/2) / this.cellH)
    };
  }
  
  onPointerDown(e) {
    const gridP = this.getGridCoords(e.clientX, e.clientY);
    
    // Check distance to A and B
    const distA = Math.hypot(gridP.x - this.pointA.x, gridP.y - this.pointA.y);
    const distB = Math.hypot(gridP.x - this.pointB.x, gridP.y - this.pointB.y);
    
    if (distA < 2) {
      this.dragTarget = this.pointA;
    } else if (distB < 2) {
      this.dragTarget = this.pointB;
    }
    
    if (this.dragTarget) {
      this.canvas.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }
  
  onPointerMove(e) {
    if (!this.dragTarget) return;
    
    const gridP = this.getGridCoords(e.clientX, e.clientY);
    // Clamp to grid
    gridP.x = Math.max(0, Math.min(this.cols - 1, gridP.x));
    gridP.y = Math.max(0, Math.min(this.rows - 1, gridP.y));
    
    this.dragTarget.x = gridP.x;
    this.dragTarget.y = gridP.y;
    this.draw();
  }
  
  onPointerUp() {
    this.dragTarget = null;
    this.canvas.style.cursor = 'crosshair';
  }
  
  getDDA() {
    let points = [];
    let dx = this.pointB.x - this.pointA.x;
    let dy = this.pointB.y - this.pointA.y;
    let steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    if (steps === 0) {
      return [{x: this.pointA.x, y: this.pointA.y}];
    }
    
    let xInc = dx / steps;
    let yInc = dy / steps;
    
    let x = this.pointA.x;
    let y = this.pointA.y;
    
    for (let i = 0; i <= steps; i++) {
      points.push({x: Math.round(x), y: Math.round(y)});
      x += xInc;
      y += yInc;
    }
    return points;
  }
  
  getBresenham() {
    let points = [];
    let x0 = this.pointA.x;
    let y0 = this.pointA.y;
    let x1 = this.pointB.x;
    let y1 = this.pointB.y;
    
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
      points.push({x: x0, y: y0});
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
    return points;
  }
  
  draw() {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const style = getComputedStyle(document.documentElement);
    const colorGrid = style.getPropertyValue('--raster-grid').trim() || '#e2e8f0';
    const colorLine = style.getPropertyValue('--raster-line').trim() || '#94a3b8';
    const colorDda = style.getPropertyValue('--raster-dda').trim() || 'rgba(59, 130, 246, 0.6)';
    const colorBresenham = style.getPropertyValue('--raster-bresenham').trim() || 'rgba(239, 68, 68, 0.6)';
    const colorBoth = style.getPropertyValue('--raster-both').trim() || '#8b5cf6';
    const colorHandle = style.getPropertyValue('--raster-handle').trim() || '#10b981';
    
    // Draw grid
    this.ctx.beginPath();
    this.ctx.strokeStyle = colorGrid;
    this.ctx.lineWidth = 0.75;
    
    for (let i = 0; i <= this.cols; i++) {
      let x = i * this.cellW;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let i = 0; i <= this.rows; i++) {
      let y = i * this.cellH;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();
    
    const ddaPoints = this.getDDA();
    const bresPoints = this.getBresenham();
    
    const drawPixel = (px, py, color) => {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        px * this.cellW,
        py * this.cellH,
        this.cellW,
        this.cellH
      );
    };
    
    if (this.mode === 'dda') {
      ddaPoints.forEach(p => drawPixel(p.x, p.y, colorDda));
    } else if (this.mode === 'bresenham') {
      bresPoints.forEach(p => drawPixel(p.x, p.y, colorBresenham));
    } else if (this.mode === 'diff') {
      // Find intersection
      const pointMap = new Map();
      ddaPoints.forEach(p => pointMap.set(`${p.x},${p.y}`, 'dda'));
      bresPoints.forEach(p => {
        const key = `${p.x},${p.y}`;
        if (pointMap.has(key)) {
          pointMap.set(key, 'both');
        } else {
          pointMap.set(key, 'bres');
        }
      });
      
      pointMap.forEach((type, key) => {
        const [x, y] = key.split(',').map(Number);
        if (type === 'dda') drawPixel(x, y, colorDda);
        else if (type === 'bres') drawPixel(x, y, colorBresenham);
        else drawPixel(x, y, colorBoth); // both
      });
    }
    
    // Draw ideal line
    this.ctx.beginPath();
    this.ctx.strokeStyle = colorLine;
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(this.pointA.x * this.cellW + this.cellW / 2, this.pointA.y * this.cellH + this.cellH / 2);
    this.ctx.lineTo(this.pointB.x * this.cellW + this.cellW / 2, this.pointB.y * this.cellH + this.cellH / 2);
    this.ctx.stroke();
    
    // Draw handles
    const drawHandle = (p, label) => {
      const cx = p.x * this.cellW + this.cellW / 2;
      const cy = p.y * this.cellH + this.cellH / 2;
      
      this.ctx.beginPath();
      this.ctx.fillStyle = colorHandle;
      this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(label, cx, cy);
    };
    
    drawHandle(this.pointA, 'A');
    drawHandle(this.pointB, 'B');
  }
}

window.RasterVisualizer = RasterVisualizer;

class CircleVisualizer {
  constructor(container) {
    this.container = container;
    this.initDOM();
    
    this.cols = 50;
    this.rows = 36;
    
    // Center (S) and a point on circle (P)
    this.center = { x: 24, y: 18 };
    this.point = { x: 36, y: 10 };
    
    this.mode = 'full'; // 'octant', 'full'
    this.dragTarget = null;
    
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.resize = this.resize.bind(this);
    
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvasContainer);
    
    this.resize();
  }
  
  initDOM() {
    this.container.innerHTML = `
      <div class="raster-container">
        <div class="raster-header">
          <div class="raster-title">Rasterizácia kružnice</div>
          <div class="raster-controls">
            <button class="raster-btn" data-mode="octant">Jeden oktant</button>
            <button class="raster-btn is-active" data-mode="full">Celá kružnica</button>
          </div>
        </div>
        <div class="raster-canvas-container">
          <canvas class="raster-canvas"></canvas>
        </div>
        <div class="raster-legend">
          <div class="raster-legend-item">
            <div class="raster-legend-swatch" style="background: var(--raster-bresenham);"></div>
            <span>Bresenhamove pixely</span>
          </div>
        </div>
      </div>
    `;
    
    this.canvasContainer = this.container.querySelector('.raster-canvas-container');
    this.canvas = this.container.querySelector('.raster-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    const btns = this.container.querySelectorAll('.raster-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.mode = btn.getAttribute('data-mode');
        this.draw();
      });
    });
  }
  
  resize() {
    const rect = this.canvasContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    
    this.cellW = this.width / this.cols;
    this.cellH = this.height / this.rows;
    
    this.draw();
  }
  
  getGridCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return {
      x: Math.round((x - this.cellW/2) / this.cellW),
      y: Math.round((y - this.cellH/2) / this.cellH)
    };
  }
  
  onPointerDown(e) {
    const gridP = this.getGridCoords(e.clientX, e.clientY);
    const distC = Math.hypot(gridP.x - this.center.x, gridP.y - this.center.y);
    const distP = Math.hypot(gridP.x - this.point.x, gridP.y - this.point.y);
    
    if (distC < 2) {
      this.dragTarget = this.center;
    } else if (distP < 2) {
      this.dragTarget = this.point;
    }
    
    if (this.dragTarget) {
      this.canvas.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }
  
  onPointerMove(e) {
    if (!this.dragTarget) return;
    const gridP = this.getGridCoords(e.clientX, e.clientY);
    gridP.x = Math.max(0, Math.min(this.cols - 1, gridP.x));
    gridP.y = Math.max(0, Math.min(this.rows - 1, gridP.y));
    
    if (this.dragTarget === this.center) {
      const dx = gridP.x - this.center.x;
      const dy = gridP.y - this.center.y;
      this.center.x = gridP.x;
      this.center.y = gridP.y;
      this.point.x = Math.max(0, Math.min(this.cols - 1, this.point.x + dx));
      this.point.y = Math.max(0, Math.min(this.rows - 1, this.point.y + dy));
    } else {
      this.point.x = gridP.x;
      this.point.y = gridP.y;
    }
    this.draw();
  }
  
  onPointerUp() {
    this.dragTarget = null;
    this.canvas.style.cursor = 'crosshair';
  }
  
  getCirclePoints() {
    const r = Math.round(Math.hypot(this.point.x - this.center.x, this.point.y - this.center.y));
    let x = 0;
    let y = r;
    let d = 3 - 2 * r;
    
    let points = [];
    
    const addSymmetric = (cx, cy, px, py) => {
      if (this.mode === 'octant') {
        points.push({x: cx + px, y: cy - py}); // Only one octant (top-right, closer to horizontal axis)
      } else {
        points.push({x: cx + px, y: cy + py});
        points.push({x: cx - px, y: cy + py});
        points.push({x: cx + px, y: cy - py});
        points.push({x: cx - px, y: cy - py});
        points.push({x: cx + py, y: cy + px});
        points.push({x: cx - py, y: cy + px});
        points.push({x: cx + py, y: cy - px});
        points.push({x: cx - py, y: cy - px});
      }
    };
    
    while (y >= x) {
      addSymmetric(this.center.x, this.center.y, x, y);
      x++;
      if (d > 0) {
        y--;
        d = d + 4 * (x - y) + 10;
      } else {
        d = d + 4 * x + 6;
      }
    }
    return points;
  }
  
  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const style = getComputedStyle(document.documentElement);
    const colorGrid = style.getPropertyValue('--raster-grid').trim() || '#e2e8f0';
    const colorLine = style.getPropertyValue('--raster-line').trim() || '#94a3b8';
    const colorBresenham = style.getPropertyValue('--raster-bresenham').trim() || 'rgba(239, 68, 68, 0.6)';
    const colorHandle = style.getPropertyValue('--raster-handle').trim() || '#10b981';
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = colorGrid;
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.cols; i++) {
      let x = i * this.cellW;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let i = 0; i <= this.rows; i++) {
      let y = i * this.cellH;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();
    
    const points = this.getCirclePoints();
    this.ctx.fillStyle = colorBresenham;
    points.forEach(p => {
      this.ctx.fillRect(p.x * this.cellW, p.y * this.cellH, this.cellW, this.cellH);
    });
    
    const cx = this.center.x * this.cellW + this.cellW / 2;
    const cy = this.center.y * this.cellH + this.cellH / 2;
    const r = Math.round(Math.hypot(this.point.x - this.center.x, this.point.y - this.center.y));
    const rPixels = r * this.cellW; // Assuming square cells ideally
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = colorLine;
    this.ctx.lineWidth = 2;
    if (this.mode === 'octant') {
      this.ctx.arc(cx, cy, rPixels, -Math.PI / 4, 0);
    } else {
      this.ctx.arc(cx, cy, rPixels, 0, Math.PI * 2);
    }
    this.ctx.stroke();
    
    const drawHandle = (p, label) => {
      const hx = p.x * this.cellW + this.cellW / 2;
      const hy = p.y * this.cellH + this.cellH / 2;
      this.ctx.beginPath();
      this.ctx.fillStyle = colorHandle;
      this.ctx.arc(hx, hy, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(label, hx, hy);
    };
    
    drawHandle(this.center, 'S');
    drawHandle(this.point, 'P');
  }
}

window.CircleVisualizer = CircleVisualizer;

document.addEventListener('DOMContentLoaded', () => {
  const mountVisualizers = () => {
    document.querySelectorAll('.raster-visualizer:not(.initialized)').forEach(el => {
      el.classList.add('initialized');
      new RasterVisualizer(el);
    });
    document.querySelectorAll('.circle-visualizer:not(.initialized)').forEach(el => {
      el.classList.add('initialized');
      new CircleVisualizer(el);
    });
  };
  
  mountVisualizers();
  
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        mountVisualizers();
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
