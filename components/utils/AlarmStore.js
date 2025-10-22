class AlarmStore {
  static key = 'nokia5130_alarms';

  static loadAll() {
    try {
      const raw = localStorage.getItem(AlarmStore.key);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  static saveAll(list) {
    try { localStorage.setItem(AlarmStore.key, JSON.stringify(list)); } catch {}
  }

  static add(alarm) {
    const list = AlarmStore.loadAll();
    const item = {
      id: alarm.id || `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      time: alarm.time || '07:00', // HH:MM 24h
      enabled: alarm.enabled ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    list.push(item);
    list.sort((a,b)=> (a.time.localeCompare(b.time)) || (a.createdAt - b.createdAt));
    AlarmStore.saveAll(list);
  }

  static toggleAt(index) {
    const list = AlarmStore.loadAll();
    if (index >= 0 && index < list.length) {
      list[index].enabled = !list[index].enabled;
      list[index].updatedAt = Date.now();
      AlarmStore.saveAll(list);
    }
  }

  static deleteAt(index) {
    const list = AlarmStore.loadAll();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      AlarmStore.saveAll(list);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlarmStore;
} else {
  window.AlarmStore = AlarmStore;
}
