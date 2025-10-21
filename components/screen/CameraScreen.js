class CameraScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.previewImg = null;
    this.previewTimer = null;
  }

  async render() {
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000; color:#fff;">
        <!-- Preview area fills screen -->
        <video autoplay playsinline muted style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;"></video>

        <!-- Top overlay icons/time -->
        <div style="position:absolute;top:0;left:0;right:0;height:16px;display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:10px;background:rgba(0,0,0,0.3);">
          <span>📷</span>
          <span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
          <span>🔋</span>
        </div>

        <!-- Soft keys -->
        <div class="camera-soft" style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:10px;font-weight:bold;">
          <div></div>
          <div>Capture</div>
          <div>Back</div>
        </div>
      </div>
    `;

    this.video = this.screenElement.querySelector('video');
    await this.startPreview();
  }

  async startPreview() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.video.srcObject = this.stream;
      await this.video.play().catch(() => {});
    } catch (e) {
      console.error('[CAMERA] Preview failed:', e);
    }
  }

  stopPreview() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  capture() {
    if (!this.video) return null;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
    }
    const vw = this.video.videoWidth || 320;
    const vh = this.video.videoHeight || 240;
    // Target portrait 3:4 to match screen
    const targetRatio = 3 / 4; // width/height
    // Compute centered crop on the video to portrait 3:4
    let cropW = Math.min(vw, Math.floor(vh * targetRatio));
    let cropH = Math.min(vh, Math.floor(cropW / targetRatio));
    const sx = Math.floor((vw - cropW) / 2);
    const sy = Math.floor((vh - cropH) / 2);

    // Draw to canvas at cropped region with target size (keep some resolution)
    const outW = 240; // portrait 240x320 fits classic 3:4
    const outH = 320;
    this.canvas.width = outW;
    this.canvas.height = outH;
    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.video, sx, sy, cropW, cropH, 0, 0, outW, outH);
    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.85);
    const item = PhotoStore.addPhoto(dataUrl, outW, outH);
    return item;
  }

  showPreview(dataUrl, durationMs = 2500) {
    // Hide video and show captured image full screen (contain)
    let img = this.previewImg;
    if (!img) {
      img = document.createElement('img');
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      this.screenElement.querySelector('.screen-content').appendChild(img);
      this.previewImg = img;
    }
    if (this.video) this.video.style.visibility = 'hidden';
    img.src = dataUrl;
    img.style.display = 'block';
    if (this.previewTimer) clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(async () => {
      img.style.display = 'none';
      if (this.video) {
        this.video.style.visibility = 'visible';
        if (!this.video.srcObject) {
          // Restart preview if stream got lost
          await this.startPreview();
        } else if (this.video.paused) {
          await this.video.play().catch(() => {});
        }
      }
    }, durationMs);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CameraScreen;
} else {
  window.CameraScreen = CameraScreen;
}


