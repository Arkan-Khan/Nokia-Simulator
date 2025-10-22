class ClockScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.mode = 'main'; // main | alarms | stopwatch | timer (placeholders)
    this.interval = null;
  }

  render() {
    this.mode = 'main';
    this.updateView();
    this.startTick();
  }

  startTick() {
    this.stopTick();
    this.interval = setInterval(() => this.updateView(), 60000);
  }

  stopTick() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }

  updateView() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false});
    const day = String(now.getDate()).padStart(2,'0');
    const mon = String(now.getMonth()+1).padStart(2,'0');
    const yr = String(now.getFullYear()).slice(-2);
    const dateStr = `${day}/${mon}/${yr}`;

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;">
        <div style="text-align:center;">
          <div style="font-size:28px;font-weight:bold;">${time}</div>
          <div style="font-size:12px;margin-top:6px;opacity:0.9;">${dateStr}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Alarms</div><div>Select</div><div>Back</div>
        </div>
      </div>`;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClockScreen;
} else {
  window.ClockScreen = ClockScreen;
}
