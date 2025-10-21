class GalleryScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.listIndex = 0;
    this.viewing = false;
  }

  renderList() {
    this.viewing = false;
    const items = PhotoStore.loadAll();
    const rows = items.map((p, i) => {
      const date = new Date(p.createdAt);
      const sizeKb = Math.round(p.sizeBytes / 1024);
      const focused = i === this.listIndex;
      return `<div class="gal-row${focused ? ' focused' : ''}" style="padding:6px 8px;display:flex;justify-content:space-between;align-items:center;background:${focused ? 'rgba(255,100,150,0.4)' : 'transparent'};border-radius:6px;margin:2px 6px;">
        <span style="font-size:10px;">Image ${items.length - i}</span>
        <span style="font-size:9px;opacity:0.85;">${sizeKb} KB • ${date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
      </div>`;
    }).join('') || '<div style="padding:10px;">No images</div>';

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Gallery</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div class="gal-list" style="position:absolute;top:18px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;padding:2px 0;">
          <div class="inner" style="position:absolute;top:0;left:0;right:0;">${rows}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Delete</div><div>Open</div><div>Back</div>
        </div>
      </div>`;

    // Scroll focused row into view within the visible area
    const container = this.screenElement.querySelector('.gal-list');
    const inner = this.screenElement.querySelector('.gal-list .inner');
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

  renderImage() {
    const items = PhotoStore.loadAll();
    if (!items.length) { this.renderList(); return; }
    const item = items[this.listIndex];
    this.viewing = true;
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;">
        <img src="${item.dataUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;background:#000;" />
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;color:#fff;">
          <div></div><div></div><div>Back</div>
        </div>
      </div>`;
  }

  deleteFocused() {
    PhotoStore.deleteAt(this.listIndex);
    if (this.listIndex > 0) this.listIndex--;
    this.renderList();
  }

  navigate(dir) {
    if (this.viewing) return; // no nav in view
    const items = PhotoStore.loadAll();
    if (!items.length) return;
    const prev = this.listIndex;
    if (dir === 'up' && this.listIndex > 0) this.listIndex--;
    if (dir === 'down' && this.listIndex < items.length - 1) this.listIndex++;
    if (this.listIndex !== prev) this.renderList();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GalleryScreen;
} else {
  window.GalleryScreen = GalleryScreen;
}


