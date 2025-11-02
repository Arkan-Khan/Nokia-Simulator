class NotepadScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.listIndex = 0;
    this.mode = 'list'; // list | edit
    this.editorBody = '';
    this.multiTap = this.createMultiTap();
    this.lastKey = null;
    this.lastKeyTime = 0;
    this.lastCycleIndex = 0;
    // Typing mode: Abc (auto-cap word), ABC, abc, 123
    this.typingMode = 'Abc';
    this.charLimit = 918;
    // Overlays within editor
    this.overlay = 'none'; // none | menu | symbols
    this.menuIndex = 0; // for options menu
    this.symbols = this.createSymbolsGrid();
    this.symRow = 0;
    this.symCol = 0;
    this.editingIndex = -1; // -1 for new note, >=0 for editing existing
  }

  createMultiTap() {
    return {
      '1': '.,?!@',
      '2': 'ABC',
      '3': 'DEF',
      '4': 'GHI',
      '5': 'JKL',
      '6': 'MNO',
      '7': 'PQRS',
      '8': 'TUV',
      '9': 'WXYZ',
      '0': ' '
    };
  }

  createSymbolsGrid() {
    // 5x5 grid of common symbols
    const flat = [
      '.', ',', '?', '!', '@',
      '-', '_', '(', ')', '/',
      '\\', ':', ';', '"', '\'',
      '&', '+', '*', '=', '%',
      '[', ']', '{', '}', '#'
    ];
    const grid = [];
    for (let i = 0; i < 5; i++) grid.push(flat.slice(i * 5, i * 5 + 5));
    return grid;
  }

  renderList() {
    this.mode = 'list';
    const items = NoteStore.loadAll();
    if (this.listIndex >= items.length) this.listIndex = Math.max(0, items.length - 1);
    const rows = items.map((n, i) => {
      const focused = i === this.listIndex;
      const date = new Date(n.updatedAt);
      const day = String(date.getDate()).padStart(2,'0');
      const mon = String(date.getMonth()+1).padStart(2,'0');
      const yr = String(date.getFullYear()).slice(-2);
      const timeStr = date.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false});
      return `<div class="note-row${focused ? ' focused' : ''}" style="padding:6px 8px;background:${focused ? 'rgba(255,100,150,0.4)' : 'transparent'};border-radius:6px;margin:2px 6px;">
        <div style="font-size:12px;font-weight:bold;">${n.title || '(Untitled)'} </div>
        <div style="display:flex;justify-content:space-between;margin-top:2px;">
          <span style="font-size:8px;opacity:0.85;">${day}/${mon}/${yr}</span>
          <span style="font-size:8px;opacity:0.85;">${timeStr}</span>
        </div>
      </div>`;
    }).join('') || '<div style="padding:10px;">No notes</div>';

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Notepad</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div class="np-list" style="position:absolute;top:18px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;padding:2px 0;">
          <div class="inner" style="position:absolute;top:0;left:0;right:0;">${rows}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>New</div><div>Select</div><div>Back</div>
        </div>
      </div>`;

    // Auto-scroll focused row into view (hidden scrollbar approach)
    try {
      const container = this.screenElement.querySelector('.np-list');
      const inner = this.screenElement.querySelector('.np-list .inner');
      const rowsEls = inner ? Array.from(inner.children) : [];
      const focusedEl = rowsEls[this.listIndex];
      if (container && inner && focusedEl) {
        const viewHeight = container.clientHeight;
        const rTop = focusedEl.offsetTop;
        const rBottom = rTop + focusedEl.offsetHeight;
        let top = parseInt(inner.style.top || '0', 10);
        if (rBottom + top > viewHeight) top = viewHeight - rBottom;
        if (rTop + top < 0) top = -rTop;
        inner.style.top = `${top}px`;
      }
    } catch {}
  }

  startNew() {
    this.mode = 'edit';
    this.editorBody = '';
    this.typingMode = 'Abc';
    this.overlay = 'none';
    this.editingIndex = -1;
    this.renderEditor();
  }

  renderEditor() {
    const lines = this.editorBody.split('\n');
    const visible = lines.join('<br/>');
    const count = this.editorBody.length;
    const topBarLeft = this.typingMode;
    const topBarRight = `${count}/${this.charLimit}`;
    const base = `
      <div class="screen-content" style="background:#000;color:#000;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:#000;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>${topBarLeft}</span><span>${topBarRight}</span>
        </div>
        <div style="position:absolute;top:18px;left:6px;right:6px;bottom:24px;overflow:auto;background:#fff;padding:6px;font-size:11px;line-height:1.2;border-radius:6px;color:#000;">
          ${visible}<span style="opacity:0.6;">_</span>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.85);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Opt</div><div></div><div>Clear</div>
        </div>
      </div>`;
    this.screenElement.innerHTML = base;

    if (this.overlay === 'menu') {
      this.renderOptionsOverlay();
    } else if (this.overlay === 'symbols') {
      this.renderSymbolsOverlay();
    }
  }

  handleKey(key) {
    if (this.mode === 'list') {
      if (key === 'UP') this.navigate('up');
      else if (key === 'DOWN') this.navigate('down');
      else if (key === 'LSK') this.startNew();
      else if (key === 'OK') this.openEditExisting();
      else if (key === 'RSK' || key === 'END') this.exitToMenu && this.exitToMenu();
      return;
    }
    if (this.mode === 'edit') {
      // Overlays first
      if (this.overlay === 'menu') {
        if (key === 'UP' || key === 'DOWN') { this.menuNavigate(key); return; }
        if (key === 'OK') { this.menuSelect(); return; }
        if (key === 'RSK') { this.overlay = 'none'; this.renderEditor(); return; }
        if (key === 'LSK') { /* ignore, stays as Opt label */ return; }
        return;
      }
      if (this.overlay === 'symbols') {
        if (key === 'UP' || key === 'DOWN' || key === 'LEFT' || key === 'RIGHT') { this.symbolsMove(key); return; }
        if (key === 'OK') { this.insertSymbol(); return; }
        if (key === 'RSK') { this.overlay = 'none'; this.renderEditor(); return; }
        return;
      }

      // Base editor controls
      if (key === 'LSK') { this.openOptionsMenu(); return; }
      if (key === 'RSK') { this.backspace(); return; }
      if (key === 'END') { this.renderList(); return; }
      if (key === '#') { this.toggleTypingMode(); return; }
      if (key === '*') { this.newline(); return; }
      if (/^[0-9]$/.test(key)) { this.handleMultiTap(key); return; }
    }
  }

  navigate(dir) {
    const items = NoteStore.loadAll();
    if (!items.length) return;
    const prev = this.listIndex;
    if (dir === 'up' && this.listIndex > 0) this.listIndex--;
    if (dir === 'down' && this.listIndex < items.length - 1) this.listIndex++;
    if (this.listIndex !== prev) this.renderList();
  }

  openEditExisting() {
    const items = NoteStore.loadAll();
    if (!items.length) { this.renderList(); return; }
    this.mode = 'edit';
    this.editorBody = String(items[this.listIndex].body || '');
    this.editingIndex = this.listIndex;
    this.renderEditor();
  }

  saveEditor() {
    if (!this.editorBody) { this.renderList(); return; }
    // If editing existing
    const items = NoteStore.loadAll();
    if (this.editingIndex >= 0 && items[this.editingIndex] && items[this.editingIndex].body === this.editorBody) {
      // unchanged; just back
      this.renderList();
      return;
    }
    if (this.editingIndex >= 0) {
      // Update existing
      NoteStore.updateAt(this.editingIndex, { body: this.editorBody });
    } else {
      // Save as new
      NoteStore.add({ body: this.editorBody });
    }
    this.renderList();
  }

  backspace() {
    if (this.editorBody.length > 0) {
      this.editorBody = this.editorBody.slice(0, -1);
      this.renderEditor();
    }
  }

  newline() {
    if (this.editorBody.length < this.charLimit) this.editorBody += '\n';
    this.renderEditor();
  }

  handleMultiTap(key) {
    const now = Date.now();
    const set = this.getCharSetForKey(key);
    if (!set) return;
    const timeout = 900;
    if (this.lastKey === key && (now - this.lastKeyTime) < timeout && this.editorBody.length > 0) {
      // cycle last char (only if last char came from same key and is in set)
      const lastChar = this.editorBody[this.editorBody.length - 1];
      let baseSet = set;
      // Determine case for Abc cycling by inspecting last char
      const wasUpper = /[A-Z]/.test(lastChar);
      if (this.typingMode === 'Abc') {
        baseSet = set.toLowerCase();
      }
      const idxInSet = baseSet.indexOf(lastChar.toLowerCase());
      if (idxInSet !== -1) {
        this.lastCycleIndex = (idxInSet + 1) % baseSet.length;
        let nextChar = baseSet[this.lastCycleIndex];
        if (this.typingMode === 'ABC') nextChar = nextChar.toUpperCase();
        else if (this.typingMode === 'abc') nextChar = nextChar.toLowerCase();
        else if (this.typingMode === 'Abc') nextChar = wasUpper ? nextChar.toUpperCase() : nextChar.toLowerCase();
        this.editorBody = this.editorBody.slice(0, -1) + nextChar;
      } else {
        this.lastCycleIndex = 0;
        this.editorBody += this.transformByMode(set[0]);
      }
    } else {
      this.lastCycleIndex = 0;
      const nextChar = this.transformByMode(set[0], true /* new char */);
      if (this.editorBody.length < this.charLimit) this.editorBody += nextChar;
    }
    this.lastKey = key;
    this.lastKeyTime = now;
    this.renderEditor();
  }

  getCharSetForKey(key) {
    // Numeric mode
    if (this.typingMode === '123') {
      if (key === '0') return ' ';
      return key; // single-character set
    }
    // Letter modes
    const set = this.multiTap[key] || '';
    if (!set) return '';
    if (this.typingMode === 'ABC') return set.toUpperCase();
    if (this.typingMode === 'abc' || this.typingMode === 'Abc') return set.toLowerCase();
    return set;
  }

  transformByMode(ch, isNew = false) {
    if (this.typingMode === '123') return ch; // digits or space
    if (this.typingMode === 'ABC') return ch.toUpperCase();
    if (this.typingMode === 'abc') return ch.toLowerCase();
    // Abc mode: uppercase if at start of text or after space/newline
    const prev = this.editorBody[this.editorBody.length - 1] || '\n';
    const atWordStart = this.editorBody.length === 0 || prev === ' ' || prev === '\n';
    return atWordStart ? ch.toUpperCase() : ch.toLowerCase();
  }

  toggleTypingMode() {
    const order = ['Abc', 'ABC', 'abc', '123'];
    const i = order.indexOf(this.typingMode);
    this.typingMode = order[(i + 1) % order.length];
    this.renderEditor();
  }

  openOptionsMenu() {
    this.overlay = 'menu';
    this.menuIndex = 0;
    this.renderEditor();
  }

  renderOptionsOverlay() {
    const options = ['Insert symbols', 'Save note'];
    if (this.editingIndex >= 0) options.push('Delete note');
    const optsHtml = options.map((opt, i) => `
      <div style="padding:6px 8px;background:${i===this.menuIndex ? 'rgba(255,255,255,0.15)' : 'transparent'};border-radius:6px;margin:2px 0;">${opt}</div>
    `).join('');
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '8px';
    overlay.style.right = '8px';
    overlay.style.top = '28px';
    overlay.style.bottom = '34px';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    overlay.style.color = '#fff';
    overlay.style.border = '1px solid rgba(255,255,255,0.2)';
    overlay.style.borderRadius = '6px';
    overlay.style.padding = '8px';
    overlay.style.fontSize = '11px';
    overlay.innerHTML = `
      <div style="font-weight:bold;margin-bottom:6px;">Options</div>
      <div>${optsHtml}</div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:24px;background:rgba(0,0,0,0.85);display:flex;justify-content:space-between;align-items:center;padding:0 8px;font-size:9px;font-weight:bold;">
        <div></div><div>Select</div><div>Back</div>
      </div>
    `;
    this.screenElement.querySelector('.screen-content').appendChild(overlay);
  }

  menuNavigate(key) {
    const base = ['Insert symbols', 'Save note'];
    const optionsLen = this.editingIndex >= 0 ? base.length + 1 : base.length;
    if (key === 'UP') this.menuIndex = (this.menuIndex - 1 + optionsLen) % optionsLen;
    if (key === 'DOWN') this.menuIndex = (this.menuIndex + 1) % optionsLen;
    this.renderEditor();
  }

  menuSelect() {
    if (this.menuIndex === 0) {
      // Insert symbols
      this.overlay = 'symbols';
      this.symRow = 0; this.symCol = 0;
      this.renderEditor();
    } else if (this.menuIndex === 1) {
      this.overlay = 'none';
      this.saveEditor();
    } else if (this.menuIndex === 2 && this.editingIndex >= 0) {
      this.overlay = 'none';
      this.deleteEditorNote();
    }
  }

  deleteEditorNote() {
    if (this.editingIndex >= 0) {
      NoteStore.deleteAt(this.editingIndex);
      this.editingIndex = -1;
    }
    this.renderList();
  }

  renderSymbolsOverlay() {
    const gridHtml = this.symbols.map((row, r) => `
      <div class="np-sym-row" style="display:flex;gap:6px;justify-content:center;margin:2px 0;">
        ${row.map((ch, c) => `
          <div style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;border:1px solid ${r===this.symRow&&c===this.symCol?'#fff':'rgba(255,255,255,0.3)'};background:${r===this.symRow&&c===this.symCol?'rgba(255,255,255,0.2)':'transparent'};border-radius:4px;">${ch}</div>
        `).join('')}
      </div>
    `).join('');
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '12px';
    overlay.style.right = '12px';
    overlay.style.top = '40px';
    overlay.style.bottom = '40px';
    overlay.style.background = 'rgba(0,0,0,0.95)';
    overlay.style.color = '#fff';
    overlay.style.border = '1px solid rgba(255,255,255,0.25)';
    overlay.style.borderRadius = '6px';
    overlay.style.padding = '8px';
    overlay.style.fontSize = '12px';
    overlay.innerHTML = `
      <div style="text-align:center;font-weight:bold;margin-bottom:8px;">Symbols</div>
      <div class="np-sym-list" style="position:absolute;left:8px;right:8px;top:34px;bottom:32px;overflow:hidden;">
        <div class="np-sym-inner" style="position:absolute;top:0;left:0;right:0;">
          ${gridHtml}
        </div>
      </div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:24px;background:rgba(0,0,0,0.85);display:flex;justify-content:space-between;align-items:center;padding:0 8px;font-size:9px;font-weight:bold;">
        <div></div><div>Select</div><div>Back</div>
      </div>
    `;
    this.screenElement.querySelector('.screen-content').appendChild(overlay);
    // Ensure selected row visible
    this.updateSymbolsScroll();
  }

  symbolsMove(key) {
    if (key === 'UP') this.symRow = (this.symRow + 5 - 1) % 5;
    if (key === 'DOWN') this.symRow = (this.symRow + 1) % 5;
    if (key === 'LEFT') this.symCol = (this.symCol + 5 - 1) % 5;
    if (key === 'RIGHT') this.symCol = (this.symCol + 1) % 5;
    this.renderEditor();
  }

  updateSymbolsScroll() {
    try {
      const container = this.screenElement.querySelector('.np-sym-list');
      const inner = this.screenElement.querySelector('.np-sym-inner');
      const rows = inner ? Array.from(inner.querySelectorAll('.np-sym-row')) : [];
      const focusedEl = rows[this.symRow];
      if (container && inner && focusedEl) {
        const viewHeight = container.clientHeight;
        const rTop = focusedEl.offsetTop;
        const rBottom = rTop + focusedEl.offsetHeight;
        let top = parseInt(inner.style.top || '0', 10);
        if (rBottom + top > viewHeight) top = viewHeight - rBottom;
        if (rTop + top < 0) top = -rTop;
        inner.style.top = `${top}px`;
      }
    } catch {}
  }

  insertSymbol() {
    const ch = this.symbols[this.symRow][this.symCol];
    if (this.editorBody.length < this.charLimit) this.editorBody += ch;
    this.overlay = 'none';
    this.renderEditor();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotepadScreen;
} else {
  window.NotepadScreen = NotepadScreen;
}
