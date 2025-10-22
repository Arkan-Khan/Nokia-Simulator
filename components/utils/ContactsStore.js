class ContactsStore {
  static key = 'nokia5130_contacts';

  static loadAll() {
    try {
      const raw = localStorage.getItem(ContactsStore.key);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch {
      return [];
    }
  }

  static saveAll(list) {
    try { localStorage.setItem(ContactsStore.key, JSON.stringify(list)); } catch {}
  }

  static add(contact) {
    const list = ContactsStore.loadAll();
    const item = {
      id: contact.id || `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      name: (contact.name || '').trim(),
      number: String(contact.number || ''),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    list.push(item);
    list.sort((a,b)=> a.name.localeCompare(b.name) || a.createdAt - b.createdAt);
    ContactsStore.saveAll(list);
  }

  static updateAt(index, updates) {
    const list = ContactsStore.loadAll();
    if (index >= 0 && index < list.length) {
      list[index] = { ...list[index], ...updates, updatedAt: Date.now() };
      list.sort((a,b)=> a.name.localeCompare(b.name) || a.createdAt - b.createdAt);
      ContactsStore.saveAll(list);
    }
  }

  static deleteAt(index) {
    const list = ContactsStore.loadAll();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      ContactsStore.saveAll(list);
    }
  }

  static clearAll() {
    ContactsStore.saveAll([]);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContactsStore;
} else {
  window.ContactsStore = ContactsStore;
}
