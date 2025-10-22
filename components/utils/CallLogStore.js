class CallLogStore {
  static key = 'nokia5130_call_logs';

  static loadAll() {
    try {
      const raw = localStorage.getItem(CallLogStore.key);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch {
      return [];
    }
  }

  static saveAll(list) {
    try {
      localStorage.setItem(CallLogStore.key, JSON.stringify(list));
    } catch {}
  }

  static add(entry) {
    const list = CallLogStore.loadAll();
    list.unshift({
      id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      timestamp: entry.timestamp || Date.now(),
      number: entry.number || '',
      type: entry.type || 'outgoing',
      contactId: entry.contactId || null,
      duration: entry.duration || null
    });
    CallLogStore.saveAll(list);
  }

  static deleteAt(index) {
    const list = CallLogStore.loadAll();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      CallLogStore.saveAll(list);
    }
  }

  static clearAll() {
    CallLogStore.saveAll([]);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CallLogStore;
} else {
  window.CallLogStore = CallLogStore;
}
