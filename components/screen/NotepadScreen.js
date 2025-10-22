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
  }

  startNew() {
    this.mode = 'edit';
    this.editorBody = '';
    this.renderEditor();
  }

  renderEditor() {
    const lines = this.editorBody.split('\n');
    const visible = lines.join('<br/>');
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Edit note</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:18px;left:6px;right:6px;bottom:24px;overflow:hidden;background:#030303;padding:6px;font-size:11px;line-height:1.2;border-radius:6px;">
          ${visible}_
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Save</div><div></div><div>Back</div>
        </div>
      </div>`;
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
      if (key === 'LSK') { this.saveEditor(); return; }
      if (key === 'RSK' || key === 'END') { this.renderList(); return; }
      if (key === 'UP' || key === 'DOWN' || key === 'LEFT' || key === 'RIGHT') {
        // No cursor; ignore
        return;
      }
      if (key === '#') { this.backspace(); return; }
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
    this.renderEditor();
  }

  saveEditor() {
    if (!this.editorBody) { this.renderList(); return; }
    // If editing existing
    const items = NoteStore.loadAll();
    if (items[this.listIndex] && items[this.listIndex].body === this.editorBody) {
      // unchanged; just back
      this.renderList();
      return;
    }
    // Save as new on LSK for simplicity
    NoteStore.add({ body: this.editorBody });
    this.renderList();
  }

  backspace() {
    if (this.editorBody.length > 0) {
      this.editorBody = this.editorBody.slice(0, -1);
      this.renderEditor();
    }
  }

  newline() {
    this.editorBody += '\n';
    this.renderEditor();
  }

  handleMultiTap(key) {
    const now = Date.now();
    const set = this.multiTap[key] || '';
    if (!set) return;
    const timeout = 900;
    if (this.lastKey === key && (now - this.lastKeyTime) < timeout && this.editorBody.length > 0) {
      // cycle last char (only if last char came from same key and is in set)
      const lastChar = this.editorBody[this.editorBody.length - 1].toUpperCase();
      if (set.includes(lastChar)) {
        this.lastCycleIndex = (this.lastCycleIndex + 1) % set.length;
        this.editorBody = this.editorBody.slice(0, -1) + set[this.lastCycleIndex];
      } else {
        this.lastCycleIndex = 0;
        this.editorBody += set[0];
      }
    } else {
      this.lastCycleIndex = 0;
      this.editorBody += set[0];
    }
    this.lastKey = key;
    this.lastKeyTime = now;
    this.renderEditor();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotepadScreen;
} else {
  window.NotepadScreen = NotepadScreen;
}
