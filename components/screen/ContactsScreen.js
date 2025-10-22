class ContactsScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.listIndex = 0;
    this.mode = 'list'; // list | view | edit
    this.filterText = '';
    this.editor = { field: 'name', name: '', number: '' };
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

  getFiltered() {
    const all = ContactsStore.loadAll();
    const q = this.filterText.trim().toUpperCase();
    if (!q) return all;
    return all.filter(c => (c.name || '').toUpperCase().includes(q));
  }

  renderList() {
    this.mode = 'list';
    const items = this.getFiltered();
    if (this.listIndex >= items.length) this.listIndex = Math.max(0, items.length - 1);
    const rows = items.map((c, i) => {
      const focused = i === this.listIndex;
      return `<div class="ct-row${focused ? ' focused' : ''}" style="padding:6px 8px;background:${focused ? 'rgba(255,100,150,0.4)' : 'transparent'};border-radius:6px;margin:2px 6px;">
        <div style="font-size:12px;font-weight:bold;">${c.name || '(No name)'}</div>
        <div style="font-size:9px;opacity:0.85;margin-top:2px;">${c.number || ''}</div>
      </div>`;
    }).join('') || '<div style="padding:10px;">No contacts</div>';

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Contacts</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:16px;left:0;right:0;height:16px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 6px;font-size:9px;">
          <span>Search: ${this.filterText}</span>
          <span style="opacity:0.7;">*:Clear  #:Bksp</span>
        </div>
        <div class="ct-list" style="position:absolute;top:34px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;padding:2px 0;">
          <div class="inner" style="position:absolute;top:0;left:0;right:0;">${rows}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Options</div><div>Select</div><div>Back</div>
        </div>
      </div>`;

    // Scroll focused row
    const container = this.screenElement.querySelector('.ct-list');
    const inner = this.screenElement.querySelector('.ct-list .inner');
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
  }

  openView() {
    const items = this.getFiltered();
    if (!items.length) { this.renderList(); return; }
    const c = items[this.listIndex];
    this.mode = 'view';
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Contact</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:20px;left:10px;right:10px;">
          <div style="font-size:12px;font-weight:bold;">${c.name || '(No name)'}</div>
          <div style="font-size:11px;margin-top:6px;">${c.number || ''}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Options</div><div>Call</div><div>Back</div>
        </div>
      </div>`;
  }

  startNew() {
    this.mode = 'edit';
    this.editor = { field: 'name', name: '', number: '' };
    this.renderEditor();
  }

  renderEditor() {
    const { name, number, field } = this.editor;
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>New contact</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:20px;left:10px;right:10px;">
          <div style="font-size:9px;opacity:0.8;">Name</div>
          <div style="font-size:12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.3);padding:2px 0;">${name}${field==='name' ? '_' : ''}</div>
          <div style="font-size:9px;opacity:0.8;margin-top:8px;">Number</div>
          <div style="font-size:12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.3);padding:2px 0;">${number}${field==='number' ? '_' : ''}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Save</div><div></div><div>Back</div>
        </div>
      </div>`;
  }

  // Input handling
  handleKey(key) {
    if (this.mode === 'list') {
      if (key === 'UP') this.navigate('up');
      else if (key === 'DOWN') this.navigate('down');
      else if (/^[0-9]$/.test(key)) { this.handleListMultiTap(key); }
      else if (key === '#') { this.backspaceFilter(); }
      else if (key === '*') { this.clearFilter(); }
      else if (key === 'LSK') { this.openOptionsList(); }
      else if (key === 'OK') { this.openView(); }
      else if (key === 'RSK' || key === 'END') { this.exitToMenu && this.exitToMenu(); }
      return;
    }
    if (this.mode === 'view') {
      if (key === 'LSK') { this.openOptionsView(); }
      else if (key === 'OK' || key==='CALL') { this.callFocused && this.callFocused(); }
      else if (key === 'RSK' || key === 'END') { this.renderList(); }
      return;
    }
    if (this.mode === 'edit') {
      if (key === 'UP' || key === 'DOWN' || key === 'OK') {
        this.editor.field = this.editor.field === 'name' ? 'number' : 'name';
        this.renderEditor();
        return;
      }
      if (key === 'LSK') { this.saveEditor(); return; }
      if (key === 'RSK' || key === 'END') { this.renderList(); return; }
      if (/^[0-9]$/.test(key)) {
        if (this.editor.field === 'number') {
          if (this.editor.number.length < 18) this.editor.number += key;
          this.renderEditor();
        } else {
          this.handleMultiTap(key);
        }
      }
    }
  }

  // Multi-tap for editor name field
  handleMultiTap(key) {
    const now = Date.now();
    const set = this.multiTap[key] || '';
    if (!set) return;
    const timeout = 900;
    if (this.lastKey === key && (now - this.lastKeyTime) < timeout && this.editor.name.length > 0) {
      // cycle last char
      this.lastCycleIndex = (this.lastCycleIndex + 1) % set.length;
      this.editor.name = this.editor.name.slice(0, -1) + set[this.lastCycleIndex];
    } else {
      // new char
      this.lastCycleIndex = 0;
      this.editor.name += set[0];
    }
    this.lastKey = key;
    this.lastKeyTime = now;
    this.renderEditor();
  }

  // Multi-tap for list filter
  handleListMultiTap(key) {
    const now = Date.now();
    const set = this.multiTap[key] || '';
    if (!set) return;
    const timeout = 900;
    if (this.lastKey === key && (now - this.lastKeyTime) < timeout && this.filterText.length > 0) {
      this.lastCycleIndex = (this.lastCycleIndex + 1) % set.length;
      // replace last filter char with cycled char
      this.filterText = this.filterText.slice(0, -1) + set[this.lastCycleIndex];
    } else {
      this.lastCycleIndex = 0;
      this.filterText += set[0];
    }
    this.lastKey = key;
    this.lastKeyTime = now;
    this.renderList();
  }

  backspaceFilter() {
    if (this.filterText.length > 0) {
      this.filterText = this.filterText.slice(0, -1);
      this.renderList();
    }
  }

  clearFilter() {
    if (this.filterText.length > 0) {
      this.filterText = '';
      this.renderList();
    }
  }

  navigate(dir) {
    const items = this.getFiltered();
    if (!items.length) return;
    const prev = this.listIndex;
    if (dir === 'up' && this.listIndex > 0) this.listIndex--;
    if (dir === 'down' && this.listIndex < items.length - 1) this.listIndex++;
    if (this.listIndex !== prev) this.renderList();
  }

  openOptionsList() {
    // LSK in list: New contact
    this.startNew();
  }

  openOptionsView() {
    // LSK in view: Edit existing
    this.mode = 'edit';
    const items = this.getFiltered();
    const c = items[this.listIndex] || { name:'', number:'' };
    this.editor = { field: 'name', name: c.name || '', number: c.number || '' };
    this.renderEditor();
  }

  saveEditor() {
    if (!this.editor.name && !this.editor.number) { this.renderList(); return; }
    ContactsStore.add({ name: this.editor.name, number: this.editor.number });
    this.filterText = '';
    this.renderList();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContactsScreen;
} else {
  window.ContactsScreen = ContactsScreen;
}
