class MediaPlayerScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.mode = 'root'; // root | ringtones | music | videos | videoplay | musicplay
    this.index = 0;
    this.items = [];
    this.audio = null;
    this.video = null;
    this.autoplayTimer = null;
    this.musicTimerId = null;
  }

  renderRoot() {
    this.mode = 'root';
    this.index = 0;
    const rows = ['Ringtones', 'Music', 'Videos'].map((name, i) => {
      const focused = i === this.index;
      return `<div style="padding:6px 8px;background:${focused?'rgba(255,100,150,0.4)':'transparent'};border-radius:6px;margin:2px 6px;display:flex;gap:6px;align-items:center;">
        <img src="assets/icons/Folder.svg" style="width:14px;height:14px;"/>
        <span style="font-size:12px;font-weight:bold;">${name}</span>
      </div>`;
    }).join('');
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Media</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:18px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;">
          <div style="position:absolute;top:0;left:0;right:0;">${rows}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Open</div><div>Select</div><div>Back</div>
        </div>
      </div>`;
  }

  async renderRingtones() {
    this.cleanup();
    this.mode = 'ringtones';
    this.index = 0;
    try {
      this.items = await MediaManifest.load('assets/ringtones/manifest.json');
    } catch { this.items = []; }
    this.renderList('Ringtones');
    this.scheduleAutoplay();
  }

  async renderMusic() {
    this.cleanup();
    this.mode = 'music';
    this.index = 0;
    try {
      this.items = await MediaManifest.load('assets/music/manifest.json');
    } catch { this.items = []; }
    this.renderList('Music');
    // No autoplay for music
  }

  async renderVideos() {
    this.cleanup();
    this.mode = 'videos';
    this.index = 0;
    try {
      this.items = await MediaManifest.load('assets/videos/manifest.json');
    } catch { this.items = []; }
    this.renderList('Videos');
  }

  renderList(title) {
    const rows = (this.items || []).map((it, i) => {
      const focused = i === this.index;
      if (title === 'Ringtones' || title === 'Music') {
        return `<div style="padding:6px 8px;background:${focused?'rgba(255,100,150,0.4)':'transparent'};border-radius:6px;margin:2px 6px;display:flex;justify-content:flex-start;">
          <span style="font-size:12px;font-weight:bold;">${it.title}</span>
        </div>`;
      }
      return `<div style="padding:6px 8px;background:${focused?'rgba(255,100,150,0.4)':'transparent'};border-radius:6px;margin:2px 6px;display:flex;justify-content:space-between;">
        <span style="font-size:12px;font-weight:bold;">${it.title}</span>
        <span style="font-size:9px;opacity:0.85;">${it.file.split('/').pop()}</span>
      </div>`;
    }).join('') || '<div style="padding:10px;">No items</div>';

    // Soft keys per section
    let left = '', center = '', right = 'Back';
    if (title === 'Videos') { left = 'Open'; center = 'Select'; }
    if (title === 'Music') { center = 'Play'; }

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>${title}</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div class="media-list" style="position:absolute;top:18px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;">
          <div class="inner" style="position:absolute;top:0;left:0;right:0;">${rows}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>${left}</div><div>${center}</div><div>${right}</div>
        </div>
      </div>`;
  }

  async openFocused() {
    if (this.mode === 'root') {
      if (this.index === 0) return this.renderRingtones();
      if (this.index === 1) return this.renderMusic();
      if (this.index === 2) return this.renderVideos();
      return;
    }
    if (this.mode === 'videos') {
      const it = this.items[this.index];
      if (!it) return;
      this.playVideo(it.file);
      return;
    }
    if (this.mode === 'music') {
      const it = this.items[this.index];
      if (!it) return;
      this.playMusicControl(this.index);
      return;
    }
    // ringtones: do nothing special on open; autoplay handles focus already
  }

  scheduleAutoplay() {
    if (this.mode !== 'ringtones') return;
    clearTimeout(this.autoplayTimer);
    this.autoplayTimer = setTimeout(()=> this.autoplayFocused(), 150);
  }

  autoplayFocused() {
    if (this.mode !== 'ringtones') return;
    const it = this.items[this.index];
    if (!it) return;
    if (this.audio) { try { this.audio.pause(); } catch {} }
    this.audio = new Audio(it.file);
    this.audio.volume = 0.8;
    this.audio.play().catch(()=>{});
  }

  playVideo(src) {
    this.cleanup();
    this.mode = 'videoplay';
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(90deg);transform-origin:center;">
          <video id="mp-video" src="${src}" style="width:320px;height:240px;background:#000;" playsinline></video>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Back</div><div>Play/Pause</div><div></div>
        </div>
      </div>`;
    this.video = this.screenElement.querySelector('#mp-video');
    try { this.video.play(); } catch {}
  }

  // Music control mode
  playMusicControl(index) {
    this.cleanup();
    this.mode = 'musicplay';
    this.index = index;
    const it = this.items[this.index];
    this.audio = new Audio(it.file);
    this.audio.volume = 0.8;
    this.audio.play().catch(()=>{});
    this.startMusicTimer();
    this.renderMusicControl();
  }

  renderMusicControl() {
    const it = this.items[this.index] || { title: '' };
    const cur = this.audio ? Math.floor(this.audio.currentTime || 0) : 0;
    const dur = this.audio && isFinite(this.audio.duration) ? Math.floor(this.audio.duration) : 0;
    const fmt = (s)=> `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;">
        <div style="text-align:center;">
          <div style="font-size:12px;margin-bottom:6px;">${it.title}</div>
          <div style="font-size:24px;font-weight:bold;">${fmt(cur)} / ${dur?fmt(dur):'--:--'}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Back</div><div>Play/Pause</div><div></div>
        </div>
      </div>`;
  }

  startMusicTimer() {
    this.stopMusicTimer();
    this.musicTimerId = setInterval(()=>{
      if (this.mode === 'musicplay') this.renderMusicControl();
    }, 500);
  }
  stopMusicTimer() { if (this.musicTimerId) { clearInterval(this.musicTimerId); this.musicTimerId = null; } }

  musicNext() {
    if (!this.items.length) return;
    this.index = (this.index + 1) % this.items.length;
    const it = this.items[this.index];
    if (this.audio) { try { this.audio.pause(); } catch {} }
    this.audio = new Audio(it.file);
    this.audio.volume = 0.8;
    this.audio.play().catch(()=>{});
    this.renderMusicControl();
  }
  musicPrev() {
    if (!this.items.length) return;
    this.index = (this.index - 1 + this.items.length) % this.items.length;
    const it = this.items[this.index];
    if (this.audio) { try { this.audio.pause(); } catch {} }
    this.audio = new Audio(it.file);
    this.audio.volume = 0.8;
    this.audio.play().catch(()=>{});
    this.renderMusicControl();
  }

  // Navigation and key handling hooks
  navigate(dir) {
    if (this.mode==='root' || this.mode==='ringtones' || this.mode==='music' || this.mode==='videos') {
      const max = (this.mode==='root') ? 3 : (this.items||[]).length;
      if (!max) return;
      const prev = this.index;
      if (dir==='up' && this.index>0) this.index--; else if (dir==='down' && this.index<max-1) this.index++;
      if (this.index!==prev) {
        if (this.mode==='root') this.renderRoot();
        else if (this.mode==='ringtones') this.renderList('Ringtones');
        else if (this.mode==='music') this.renderList('Music');
        else if (this.mode==='videos') this.renderList('Videos');
        if (this.mode==='ringtones') this.scheduleAutoplay();
      }
    }
  }

  back() {
    if (this.mode==='videoplay') { if (this.video) { try { this.video.pause(); } catch {} } this.renderVideos(); return; }
    if (this.mode==='musicplay') { if (this.audio) { try { this.audio.pause(); } catch {} } this.stopMusicTimer(); this.renderMusic(); return; }
    if (this.mode==='ringtones' || this.mode==='music' || this.mode==='videos') { this.cleanup(); this.renderRoot(); return; }
  }

  togglePlayPause() {
    if (this.mode==='ringtones') {
      // optional: do nothing (autoplay)
    } else if (this.mode==='musicplay') {
      if (this.audio) { if (this.audio.paused) this.audio.play().catch(()=>{}); else this.audio.pause(); this.renderMusicControl(); }
    } else if (this.mode==='videoplay') {
      if (this.video) { if (this.video.paused) this.video.play().catch(()=>{}); else this.video.pause(); }
    }
  }

  adjustVolume(delta) {
    if (this.mode==='ringtones') {
      if (this.audio) this.audio.volume = Math.max(0, Math.min(1, this.audio.volume + delta));
    } else if (this.mode==='musicplay') {
      if (this.audio) this.audio.volume = Math.max(0, Math.min(1, this.audio.volume + delta)); this.renderMusicControl();
    } else if (this.mode==='videoplay') {
      if (this.video) this.video.volume = Math.max(0, Math.min(1, this.video.volume + delta));
    }
  }

  seek(seconds) {
    if (this.mode==='videoplay' && this.video) {
      try { this.video.currentTime = Math.max(0, this.video.currentTime + seconds); } catch {}
    }
  }

  cleanup() {
    clearTimeout(this.autoplayTimer);
    this.stopMusicTimer();
    if (this.audio) { try { this.audio.pause(); } catch {} this.audio = null; }
    if (this.video) { try { this.video.pause(); } catch {} this.video = null; }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaPlayerScreen;
} else {
  window.MediaPlayerScreen = MediaPlayerScreen;
}
