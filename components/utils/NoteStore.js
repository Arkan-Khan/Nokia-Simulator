class NoteStore {
  static key = 'nokia5130_notes';

  static loadAll() {
    try {
      const raw = localStorage.getItem(NoteStore.key);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  static saveAll(list) {
    try { localStorage.setItem(NoteStore.key, JSON.stringify(list)); } catch {}
  }

  static add(note) {
    const list = NoteStore.loadAll();
    const body = String(note.body || '');
    const title = (body.split(/\r?\n/)[0] || '').slice(0, 40);
    const item = {
      id: note.id || `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      title,
      body,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    list.unshift(item);
    NoteStore.saveAll(list);
  }

  static updateAt(index, updates) {
    const list = NoteStore.loadAll();
    if (index >= 0 && index < list.length) {
      const merged = { ...list[index], ...updates };
      merged.title = (merged.body.split(/\r?\n/)[0] || '').slice(0, 40);
      merged.updatedAt = Date.now();
      list[index] = merged;
      NoteStore.saveAll(list);
    }
  }

  static deleteAt(index) {
    const list = NoteStore.loadAll();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      NoteStore.saveAll(list);
    }
  }

  static clearAll() { NoteStore.saveAll([]); }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NoteStore;
} else {
  window.NoteStore = NoteStore;
}
