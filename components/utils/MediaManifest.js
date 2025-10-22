class MediaManifest {
  static async load(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Manifest not found: ${path}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Manifest must be an array');
    return data
      .filter(item => item && typeof item.file === 'string')
      .map((item, idx) => ({
        id: item.id || `${idx}`,
        title: item.title || item.file.split('/').pop(),
        file: item.file,
        type: item.type || 'unknown'
      }));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaManifest;
} else {
  window.MediaManifest = MediaManifest;
}
