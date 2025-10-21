class PhotoStore {
  static key = 'nokia5130_photos';

  static loadAll() {
    try {
      const raw = localStorage.getItem(PhotoStore.key);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  static saveAll(list) {
    try {
      localStorage.setItem(PhotoStore.key, JSON.stringify(list));
    } catch {}
  }

  static addPhoto(dataUrl, width, height) {
    const list = PhotoStore.loadAll();
    const item = {
      id: Date.now(),
      dataUrl,
      width,
      height,
      sizeBytes: Math.ceil((dataUrl.length * 3) / 4),
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    PhotoStore.saveAll(list);
    return item;
  }

  static deleteAt(index) {
    const list = PhotoStore.loadAll();
    if (index < 0 || index >= list.length) return list;
    list.splice(index, 1);
    PhotoStore.saveAll(list);
    return list;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhotoStore;
} else {
  window.PhotoStore = PhotoStore;
}


