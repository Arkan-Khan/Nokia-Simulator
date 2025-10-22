class CallsScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.listIndex = 0;
  }

  renderList() {
    const items = CallLogStore.loadAll();
    const rows = items.map((c, i) => {
      const d = new Date(c.timestamp);
      const focused = i === this.listIndex;
      const label = c.number || 'Unknown';
      const typeIcon = c.type === 'missed' ? '❗' : (c.type === 'incoming' ? '⬇️' : '⬆️');
      const day = String(d.getDate()).padStart(2,'0');
      const mon = String(d.getMonth()+1).padStart(2,'0');
      const yr = String(d.getFullYear()).slice(-2);
      const dateStr = `${day}/${mon}/${yr}`;
      const timeStr = d.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit', hour12:false});
      return `<div class="call-row${focused ? ' focused' : ''}" style="padding:6px 8px;background:${focused ? 'rgba(255,100,150,0.4)' : 'transparent'};border-radius:6px;margin:2px 6px;">
        <div style="display:flex;gap:6px;align-items:center;">
          <span style="font-size:10px;">${typeIcon}</span>
          <span style="font-size:12px;font-weight:bold;">${label}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
          <span style="font-size:8px;opacity:0.85;">${dateStr}</span>
          <span style="font-size:8px;opacity:0.85;">${timeStr}</span>
        </div>
      </div>`;
    }).join('') || '<div style="padding:10px;">No recent calls</div>';

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Calls</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div class="calls-list" style="position:absolute;top:18px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;padding:2px 0;">
          <div class="inner" style="position:absolute;top:0;left:0;right:0;">${rows}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Delete</div><div>Call</div><div>Back</div>
        </div>
      </div>`;

    // Scroll focused row into view
    const container = this.screenElement.querySelector('.calls-list');
    const inner = this.screenElement.querySelector('.calls-list .inner');
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

  navigate(dir) {
    const items = CallLogStore.loadAll();
    if (!items.length) return;
    const prev = this.listIndex;
    if (dir === 'up' && this.listIndex > 0) this.listIndex--;
    if (dir === 'down' && this.listIndex < items.length - 1) this.listIndex++;
    if (this.listIndex !== prev) this.renderList();
  }

  deleteFocused() {
    CallLogStore.deleteAt(this.listIndex);
    if (this.listIndex > 0) this.listIndex--;
    this.renderList();
  }

  getFocusedNumber() {
    const items = CallLogStore.loadAll();
    const item = items[this.listIndex];
    return item ? (item.number || '') : '';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CallsScreen;
} else {
  window.CallsScreen = CallsScreen;
}
