class TuringVisualizer {
  constructor(container) {
    this.container = container;
    
    this.machines = {
      invert: {
        id: 'invert',
        title: 'Invertor bitov',
        subtitle: 'Mení 0 na 1 a naopak. Zastaví pri prázdnom znaku.',
        initialState: 'q0',
        acceptState: 'q_acc',
        transitions: {
          'q0': {
            '0': { write: '1', move: 1, next: 'q0' },
            '1': { write: '0', move: 1, next: 'q0' },
            '_': { write: '_', move: 0, next: 'q_acc' }
          }
        },
        defaultInput: '1101'
      },
      increment: {
        id: 'increment',
        title: '+1 k binárnemu číslu',
        subtitle: 'Pripočíta 1. Ide na koniec, potom sprava doľava rieši prenos.',
        initialState: 'q0',
        acceptState: 'q_acc',
        transitions: {
          'q0': {
            '0': { write: '0', move: 1, next: 'q0' },
            '1': { write: '1', move: 1, next: 'q0' },
            '_': { write: '_', move: -1, next: 'q1' } // Found end, go left
          },
          'q1': {
            '1': { write: '0', move: -1, next: 'q1' }, // Carry over
            '0': { write: '1', move: 0, next: 'q_acc' }, // Done
            '_': { write: '1', move: 0, next: 'q_acc' } // Overflow
          }
        },
        defaultInput: '1011'
      }
    };
    
    this.currentMachineId = 'invert';
    this.tape = [];
    this.headPos = 0;
    this.state = null;
    this.isPlaying = false;
    this.isHalted = false;
    this.playInterval = null;
    
    this.initDOM();
    this.bindEvents();
    this.loadMachine(this.currentMachineId);
  }
  
  static playIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  }

  static pauseIcon() {
    return `<svg viewBox="0 0 24 24"><path d="M8 5h3v14H8z"/><path d="M13 5h3v14h-3z"/></svg>`;
  }

  setPlayButton(isPlaying) {
    this.btnPlay.innerHTML = isPlaying ? TuringVisualizer.pauseIcon() : TuringVisualizer.playIcon();
    this.btnPlay.title = isPlaying ? 'Pauza' : 'Prehrať';
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="turing-container">
        <div class="turing-header">
          <div class="turing-title-block">
            <div class="turing-title" id="turing-title">Názov stroja</div>
            <div class="turing-subtitle" id="turing-subtitle">Popis</div>
          </div>
          <div class="turing-controls-mode">
            <button class="turing-btn-mode is-active" data-mode="invert">Invertor</button>
            <button class="turing-btn-mode" data-mode="increment">Inkrementácia</button>
          </div>
        </div>
        <div class="turing-stage">
          <div class="turing-input-wrapper">
            <span class="turing-input-label">Vstup (0 a 1):</span>
            <input type="text" class="turing-input" value="1101" pattern="[01]*" maxlength="15">
          </div>
          
          <div class="turing-machine-core">
            <div class="turing-state-badge" id="turing-state">q0</div>
            <div class="turing-tape-wrapper">
              <div class="turing-head-pointer" style="--head-pos: 0">
                <svg viewBox="0 0 24 24"><path d="M12 20l-8-8h6V4h4v8h6z"/></svg>
              </div>
              <div class="turing-tape" id="turing-tape"></div>
            </div>
          </div>
        </div>
        <div class="turing-footer">
          <div class="turing-log" id="turing-log">Pripravené na spustenie.</div>
          <div class="turing-actions">
            <button class="turing-btn turing-btn-step">Krok</button>
            <button class="turing-btn turing-btn-primary turing-btn-play" title="Prehrať">
              ${TuringVisualizer.playIcon()}
            </button>
            <button class="turing-btn turing-btn-reset" title="Reset">
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
    
    this.elTitle = this.container.querySelector('#turing-title');
    this.elSubtitle = this.container.querySelector('#turing-subtitle');
    this.elTape = this.container.querySelector('#turing-tape');
    this.elInput = this.container.querySelector('.turing-input');
    this.elLog = this.container.querySelector('#turing-log');
    this.elState = this.container.querySelector('#turing-state');
    this.elPointer = this.container.querySelector('.turing-head-pointer');
    
    this.btnReset = this.container.querySelector('.turing-btn-reset');
    this.btnStep = this.container.querySelector('.turing-btn-step');
    this.btnPlay = this.container.querySelector('.turing-btn-play');
    this.btnModes = this.container.querySelectorAll('.turing-btn-mode');
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
    this.reset();
  }
  
  reset() {
    this.pause();
    const inputStr = this.elInput.value || '';
    
    // Create tape with blank buffers on sides
    this.tape = ['_'];
    for(let c of inputStr) {
      this.tape.push(c);
    }
    this.tape.push('_', '_'); // couple of extra blanks on the right
    
    this.headPos = 1; // start at first actual char
    
    const m = this.machines[this.currentMachineId];
    this.state = m.initialState;
    this.isHalted = false;
    
    this.updateUI('Pripravené na spustenie.');
    this.elLog.className = 'turing-log';
    
    // Clear written highlights
    Array.from(this.elTape.children).forEach(c => c.classList.remove('is-written'));
  }
  
  renderTape() {
    let html = '';
    this.tape.forEach((sym) => {
      html += `<div class="turing-cell">${sym === '_' ? ' ' : sym}</div>`;
    });
    this.elTape.innerHTML = html;
    this.elPointer.style.setProperty('--head-pos', this.headPos);
  }
  
  updateUI(logMsg) {
    this.renderTape();
    
    const m = this.machines[this.currentMachineId];
    
    this.elState.textContent = this.state;
    this.elState.className = 'turing-state-badge';
    
    if (this.state === m.acceptState) {
      this.elState.classList.add('is-accept');
      this.isHalted = true;
    } else if (this.state === 'q_rej') {
      this.elState.classList.add('is-reject');
      this.isHalted = true;
    }
    
    if (logMsg) {
      this.elLog.textContent = logMsg;
    }
    
    this.btnStep.disabled = this.isHalted;
    this.btnPlay.disabled = this.isHalted;
    if (!this.isHalted) this.setPlayButton(this.isPlaying);
  }
  
  step() {
    if (this.isHalted) return;
    
    const m = this.machines[this.currentMachineId];
    const symbol = this.tape[this.headPos] || '_';
    const stateTransitions = m.transitions[this.state];
    
    if (!stateTransitions) {
      this.state = 'q_rej';
      this.updateUI(`CHYBA: Nedefinovaný stav ${this.state}.`);
      return;
    }
    
    const action = stateTransitions[symbol];
    if (!action) {
      this.state = 'q_rej';
      this.updateUI(`CHYBA: Žiadne pravidlo pre (${this.state}, '${symbol}').`);
      return;
    }
    
    const oldSymbol = symbol;
    this.tape[this.headPos] = action.write;
    
    let directionStr = 'zostávam na mieste';
    if (action.move === 1) directionStr = 'posúvam hlavu doprava';
    if (action.move === -1) directionStr = 'posúvam hlavu doľava';
    
    let displayOld = oldSymbol === '_' ? 'prázdny znak' : `${oldSymbol}`;
    let displayWrite = action.write === '_' ? 'prázdny znak' : `${action.write}`;
    
    const msg = `Čítam ${displayOld}, zapisujem ${displayWrite}, ${directionStr}. Stav: ${action.next} `;
    
    // Dynamic tape expansion
    let offset = 0;
    if (this.headPos === 0 && action.move === -1) {
      this.tape.unshift('_');
      offset = 1; // Head stays at 0 physically, but tape shifted
    } else if (this.headPos === this.tape.length - 1 && action.move === 1) {
      this.tape.push('_');
      this.headPos += action.move;
    } else {
      this.headPos += action.move;
    }
    
    this.state = action.next;
    
    this.updateUI(msg);
    
    // Highlight written cell
    if (oldSymbol !== action.write) {
      // Find the cell we just wrote to. It's at (this.headPos - action.move + offset)
      const writtenIndex = this.headPos - action.move + offset;
      const cell = this.elTape.children[writtenIndex];
      if (cell) {
         cell.classList.add('is-written');
         setTimeout(() => cell.classList.remove('is-written'), 400);
      }
    }
    
    if (this.state === m.acceptState) {
      this.elLog.textContent = 'Výpočet úspešne dokončený (Zastavenie).';
      this.elLog.classList.add('is-accept');
    }
  }
  
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.isHalted) this.reset();
      this.play();
    }
  }
  
  play() {
    if (this.isHalted) return;
    this.isPlaying = true;
    this.setPlayButton(true);
    this.btnStep.disabled = true;
    this.elInput.disabled = true;
    
    this.playInterval = setInterval(() => {
      if (this.isHalted) {
        this.pause();
      } else {
        this.step();
      }
    }, 600);
  }
  
  pause() {
    this.isPlaying = false;
    this.setPlayButton(false);
    this.btnStep.disabled = this.isHalted;
    this.elInput.disabled = false;
    clearInterval(this.playInterval);
  }
}

window.TuringVisualizer = TuringVisualizer;

document.addEventListener('DOMContentLoaded', () => {
  const mountTurings = () => {
    document.querySelectorAll('.turing-visualizer:not(.initialized)').forEach(el => {
      el.classList.add('initialized');
      new TuringVisualizer(el);
    });
  };
  
  mountTurings();
  
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) mountTurings();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});