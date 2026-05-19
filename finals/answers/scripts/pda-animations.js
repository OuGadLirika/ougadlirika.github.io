class PdaVisualizer {
  constructor(container) {
    this.container = container;
    this.initDOM();
    
    this.word = 'aabb';
    this.currentIndex = 0;
    this.stack = [];
    this.phase = 'reading_a'; // 'reading_a', 'reading_b', 'rejected', 'accepted'
    this.isPlaying = false;
    this.playInterval = null;
    
    this.bindEvents();
    this.reset();
  }
  
  static playIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  }

  static pauseIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M8 5h3v14H8z"/><path d="M13 5h3v14h-3z"/></svg>`;
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="pda-container">
        <div class="pda-header">
          <div class="pda-title-block">
            <div class="pda-title">Zásobníkový automat pre aⁿbⁿ</div>
            <div class="pda-subtitle">L = { aⁿbⁿ | n ≥ 0 }. Ukladá 'a' na zásobník, pri 'b' ich odoberá.</div>
          </div>
        </div>
        <div class="pda-stage">
          <div class="pda-tape-section">
            <div class="pda-input-wrapper">
              <span class="pda-input-label">Vstup (a, b):</span>
              <input type="text" class="pda-input" value="aabb" pattern="[ab]*" maxlength="12">
            </div>
            <div class="pda-tape" id="pda-tape"></div>
          </div>
          <div class="pda-stack-section">
            <div class="pda-stack-label">Zásobník</div>
            <div class="pda-stack" id="pda-stack"></div>
          </div>
        </div>
        <div class="pda-footer">
          <div class="pda-log" id="pda-log">Pripravené na spustenie.</div>
          <div class="pda-actions">
            <button class="pda-btn pda-btn-step">Krok</button>
            <button class="pda-btn pda-btn-primary pda-btn-play" title="Prehrať">
              ${PdaVisualizer.playIcon()}
            </button>
            <button class="pda-btn pda-btn-reset" title="Reset">
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
    
    this.elTape = this.container.querySelector('#pda-tape');
    this.elStack = this.container.querySelector('#pda-stack');
    this.elInput = this.container.querySelector('.pda-input');
    this.elLog = this.container.querySelector('#pda-log');
    
    this.btnReset = this.container.querySelector('.pda-btn-reset');
    this.btnStep = this.container.querySelector('.pda-btn-step');
    this.btnPlay = this.container.querySelector('.pda-btn-play');
  }

  setPlayButton(isPlaying) {
    this.btnPlay.innerHTML = isPlaying ? PdaVisualizer.pauseIcon() : PdaVisualizer.playIcon();
    this.btnPlay.title = isPlaying ? 'Pauza' : 'Prehrať';
  }
  
  bindEvents() {
    this.elInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().replace(/[^ab]/g, '');
      e.target.value = val;
      this.reset();
    });
    
    this.btnReset.addEventListener('click', () => this.reset());
    this.btnStep.addEventListener('click', () => this.step());
    this.btnPlay.addEventListener('click', () => this.togglePlay());
  }
  
  reset() {
    this.pause();
    this.word = this.elInput.value;
    this.currentIndex = 0;
    this.stack = [];
    this.phase = 'reading_a';
    this.elLog.className = 'pda-log';
    this.updateUI('Pripravené.');
  }
  
  updateUI(logMsg) {
    // Tape
    let tapeHtml = '';
    for (let i = 0; i < this.word.length; i++) {
      let cls = 'pda-tape-cell';
      if (i < this.currentIndex) cls += ' is-past';
      if (i === this.currentIndex && this.phase !== 'rejected' && this.phase !== 'accepted') cls += ' is-active';
      tapeHtml += `<div class="${cls}">${this.word[i]}</div>`;
    }
    if (this.word.length === 0) tapeHtml = '<div class="pda-tape-cell" style="opacity:0.3">ε</div>';
    this.elTape.innerHTML = tapeHtml;
    
    // Stack
    let stackHtml = '';
    if (this.stack.length === 0) {
      stackHtml = '<div class="pda-stack-empty">prázdny</div>';
    } else {
      for (let i = 0; i < this.stack.length; i++) {
        stackHtml += `<div class="pda-stack-item" id="stack-item-${i}">${this.stack[i]}</div>`;
      }
    }
    this.elStack.innerHTML = stackHtml;
    
    // Check end conditions
    const isDone = this.currentIndex >= this.word.length && (this.phase === 'reading_a' || this.phase === 'reading_b');
    
    if (this.phase === 'rejected') {
      this.elLog.textContent = `Zamietnuté: ${logMsg}`;
      this.elLog.className = 'pda-log is-reject';
      this.btnStep.disabled = true;
      this.btnPlay.disabled = true;
      this.setPlayButton(false);
    } else if (this.phase === 'accepted') {
      this.elLog.textContent = 'Akceptované: Slovo patrí do jazyka aⁿbⁿ.';
      this.elLog.className = 'pda-log is-accept';
      this.btnStep.disabled = true;
      this.btnPlay.disabled = true;
      this.setPlayButton(false);
    } else if (isDone) {
      if (this.stack.length === 0) {
        this.phase = 'accepted';
        this.updateUI();
      } else {
        this.phase = 'rejected';
        this.updateUI('Na konci slova nie je zásobník prázdny (zostali nedopárované "a").');
      }
    } else {
      if (logMsg) this.elLog.textContent = logMsg;
      this.btnStep.disabled = false;
      this.btnPlay.disabled = this.word.length === 0;
    }
  }
  
  step() {
    if (this.phase === 'rejected' || this.phase === 'accepted') return;
    
    if (this.currentIndex >= this.word.length) {
      if (this.stack.length === 0) this.phase = 'accepted';
      else this.phase = 'rejected';
      this.updateUI();
      return;
    }
    
    const char = this.word[this.currentIndex];
    
    if (char === 'a') {
      if (this.phase === 'reading_b') {
        this.phase = 'rejected';
        this.updateUI('Znak "a" nasleduje po znaku "b". Nesprávny formát.');
        return;
      }
      this.stack.push('a');
      this.currentIndex++;
      this.updateUI('Čítam "a": Pridávam na zásobník.');
    } else if (char === 'b') {
      this.phase = 'reading_b';
      if (this.stack.length === 0) {
        this.phase = 'rejected';
        this.updateUI('Čítam "b": Zásobník je prázdny. Chýbajú "a" na dopárovanie.');
        return;
      }
      
      const topIndex = this.stack.length - 1;
      const topEl = this.elStack.querySelector(`#stack-item-${topIndex}`);
      if (topEl) {
        topEl.classList.add('is-popping');
        setTimeout(() => {
          this.stack.pop();
          this.currentIndex++;
          this.updateUI('Čítam "b": Odoberám "a" zo zásobníka.');
        }, 200);
      } else {
        this.stack.pop();
        this.currentIndex++;
        this.updateUI('Čítam "b": Odoberám "a" zo zásobníka.');
      }
    }
  }
  
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.phase === 'rejected' || this.phase === 'accepted') this.reset();
      this.play();
    }
  }
  
  play() {
    this.isPlaying = true;
    this.setPlayButton(true);
    this.btnStep.disabled = true;
    this.elInput.disabled = true;
    
    this.playInterval = setInterval(() => {
      if (this.phase === 'rejected' || this.phase === 'accepted') {
        this.pause();
      } else {
        this.step();
      }
    }, 800);
  }
  
  pause() {
    this.isPlaying = false;
    this.setPlayButton(false);
    this.btnStep.disabled = (this.phase === 'rejected' || this.phase === 'accepted');
    this.elInput.disabled = false;
    clearInterval(this.playInterval);
  }
}

window.PdaVisualizer = PdaVisualizer;

document.addEventListener('DOMContentLoaded', () => {
  const mountPdas = () => {
    document.querySelectorAll('.pda-visualizer:not(.initialized)').forEach(el => {
      el.classList.add('initialized');
      new PdaVisualizer(el);
    });
  };
  
  mountPdas();
  
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) mountPdas();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});