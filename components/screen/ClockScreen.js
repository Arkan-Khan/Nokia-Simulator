class ClockScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.mode = 'main'; // main | alarms | alarmEdit | stopwatch | timer
    this.clockIntervalId = null;
    this.alarmIndex = 0;
    this.stopwatchRunning = false;
    this.stopwatchStart = 0;
    this.stopwatchElapsed = 0; // ms
    this.stopwatchIntervalId = null;
    this.timerMs = 0;
    this.timerRunning = false;
    this.timerIntervalId = null;
    this.alarmEditField = 'hour';
    this.alarmEditHour = 7;
    this.alarmEditMinute = 0;
  }

  render() {
    this.mode = 'main';
    this.updateView();
    this.startClockTick();
  }

  // Generic minute tick for main clock view
  startClockTick() { this.stopClockTick(); this.clockIntervalId = setInterval(() => this.updateView(), 60000); }
  stopClockTick() { if (this.clockIntervalId) { clearInterval(this.clockIntervalId); this.clockIntervalId = null; } }

  // Stopwatch ticking (smooth updates)
  startStopwatchTick() { this.stopStopwatchTick(); this.stopwatchIntervalId = setInterval(() => this.renderStopwatch(), 250); }
  stopStopwatchTick() { if (this.stopwatchIntervalId) { clearInterval(this.stopwatchIntervalId); this.stopwatchIntervalId = null; } }

  // Timer ticking (counts down)
  startTimerTick() {
    this.stopTimerTick();
    this.timerIntervalId = setInterval(() => {
      if (!this.timerRunning) return;
      this.timerMs = Math.max(0, this.timerMs - 250);
      if (this.timerMs === 0) this.timerRunning = false;
      this.renderTimer();
    }, 250);
  }
  stopTimerTick() { if (this.timerIntervalId) { clearInterval(this.timerIntervalId); this.timerIntervalId = null; } }

  handleKey(key) {
    // Global END: exit to menu
    if (key === 'END') { this.exitToMenu && this.exitToMenu(); return; }

    if (this.mode === 'main') {
      if (key === 'LSK') { this.mode = 'alarms'; this.renderAlarms(); return; }
      if (key === 'OK') { this.mode = 'stopwatch'; this.renderStopwatch(); return; }
      if (key === 'RSK') { this.exitToMenu && this.exitToMenu(); return; }
    } else if (this.mode === 'alarms') {
      if (key === 'UP') this.navigateAlarms('up');
      else if (key === 'DOWN') this.navigateAlarms('down');
      else if (key === 'LSK') this.addAlarm();
      else if (key === 'OK') this.enterAlarmEdit();
      else if (key === 'RSK') { this.mode = 'main'; this.updateView(); }
      else if (key === 'CALL' || key === '#') this.toggleAlarm();
      else if (key === '*') this.deleteAlarm();
    } else if (this.mode === 'alarmEdit') {
      if (key === 'LEFT' || key === 'RIGHT') { this.alarmEditField = (this.alarmEditField === 'hour' ? 'minute' : 'hour'); this.renderAlarmEdit(); }
      else if (key === 'UP') { this.incAlarmField(+1); }
      else if (key === 'DOWN') { this.incAlarmField(-1); }
      else if (key === 'LSK') { this.saveAlarmEdit(); }
      else if (key === 'RSK') { this.mode = 'alarms'; this.renderAlarms(); }
    } else if (this.mode === 'stopwatch') {
      if (key === 'LSK') this.toggleStopwatch();
      else if (key === 'OK') this.resetStopwatch();
      else if (key === 'RSK') { this.mode = 'timer'; this.renderTimer(); }
    } else if (this.mode === 'timer') {
      if (key === 'UP') this.adjustTimer(60); // +1 min
      else if (key === 'DOWN') this.adjustTimer(-60);
      else if (key === 'LEFT') this.adjustTimer(-10); // -10s
      else if (key === 'RIGHT') this.adjustTimer(10); // +10s
      else if (key === 'LSK') this.toggleTimer();
      else if (key === 'RSK') { this.mode = 'main'; this.stopTimerTick(); this.updateView(); }
    }
  }

  // MAIN
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
          <div>Alarms</div><div>Stopwatch</div><div>Back</div>
        </div>
      </div>`;
  }

  // ALARMS
  renderAlarms() {
    const list = AlarmStore.loadAll();
    if (this.alarmIndex >= list.length) this.alarmIndex = Math.max(0, list.length - 1);
    const rows = list.map((a,i)=>{
      const focused = i === this.alarmIndex;
      return `<div style="padding:6px 8px;background:${focused?'rgba(255,100,150,0.4)':'transparent'};border-radius:6px;margin:2px 6px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;font-weight:bold;">${a.time}</span>
        <span style="font-size:9px;opacity:0.85;">${a.enabled? 'On':'Off'}</span>
      </div>`;
    }).join('') || '<div style="padding:10px;">No alarms</div>';

    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;">
        <div style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(20,20,20,0.9);display:flex;justify-content:space-between;align-items:center;padding:0 6px;font-size:9px;font-weight:bold;">
          <span>Alarms</span><span>${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</span>
        </div>
        <div style="position:absolute;top:18px;left:0;right:0;bottom:24px;overflow:hidden;background:#060606;">
          <div style="position:absolute;top:0;left:0;right:0;">${rows}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>New</div><div>Edit</div><div>Back</div>
        </div>
      </div>`;
  }
  navigateAlarms(dir) {
    const list = AlarmStore.loadAll();
    if (!list.length) return;
    if (dir==='up' && this.alarmIndex>0) this.alarmIndex--;
    if (dir==='down' && this.alarmIndex<list.length-1) this.alarmIndex++;
    this.renderAlarms();
  }
  addAlarm() { AlarmStore.add({ time: '07:00', enabled: true }); this.renderAlarms(); }
  toggleAlarm() { AlarmStore.toggleAt(this.alarmIndex); this.renderAlarms(); }
  deleteAlarm() { AlarmStore.deleteAt(this.alarmIndex); if (this.alarmIndex>0) this.alarmIndex--; this.renderAlarms(); }

  enterAlarmEdit() {
    const list = AlarmStore.loadAll();
    if (!list.length) { this.renderAlarms(); return; }
    const cur = list[this.alarmIndex];
    const [h,m] = (cur.time || '07:00').split(':').map(s=>parseInt(s,10));
    this.alarmEditHour = isNaN(h)?7:h;
    this.alarmEditMinute = isNaN(m)?0:m;
    this.alarmEditField = 'hour';
    this.mode = 'alarmEdit';
    this.renderAlarmEdit();
  }
  incAlarmField(delta) {
    if (this.alarmEditField === 'hour') {
      this.alarmEditHour = (this.alarmEditHour + delta + 24) % 24;
    } else {
      this.alarmEditMinute = (this.alarmEditMinute + delta + 60) % 60;
    }
    this.renderAlarmEdit();
  }
  renderAlarmEdit() {
    const hh = String(this.alarmEditHour).padStart(2,'0');
    const mm = String(this.alarmEditMinute).padStart(2,'0');
    const underHour = this.alarmEditField === 'hour' ? 'underline' : 'none';
    const underMin = this.alarmEditField === 'minute' ? 'underline' : 'none';
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;">
        <div style="text-align:center;">
          <div style="font-size:24px;font-weight:bold;">
            <span style="text-decoration:${underHour}">${hh}</span>:<span style="text-decoration:${underMin}">${mm}</span>
          </div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>Save</div><div></div><div>Back</div>
        </div>
      </div>`;
  }
  saveAlarmEdit() {
    const list = AlarmStore.loadAll();
    if (!list.length) { this.mode='alarms'; this.renderAlarms(); return; }
    const time = `${String(this.alarmEditHour).padStart(2,'0')}:${String(this.alarmEditMinute).padStart(2,'0')}`;
    list[this.alarmIndex] = { ...list[this.alarmIndex], time, updatedAt: Date.now() };
    AlarmStore.saveAll(list);
    this.mode = 'alarms';
    this.renderAlarms();
  }

  // STOPWATCH
  renderStopwatch() {
    const elapsedMs = this.stopwatchElapsed + (this.stopwatchRunning ? (Date.now() - this.stopwatchStart) : 0);
    const s = Math.floor(elapsedMs/1000);
    const mm = String(Math.floor(s/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;">
        <div style="text-align:center;">
          <div style="font-size:24px;font-weight:bold;">${mm}:${ss}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>${this.stopwatchRunning? 'Stop':'Start'}</div><div>Reset</div><div>Timer</div>
        </div>
      </div>`;
  }
  toggleStopwatch() {
    if (this.stopwatchRunning) {
      this.stopwatchElapsed += Date.now() - this.stopwatchStart;
      this.stopwatchRunning = false;
      this.stopStopwatchTick();
    } else {
      this.stopwatchStart = Date.now();
      this.stopwatchRunning = true;
      this.startStopwatchTick();
    }
    this.renderStopwatch();
  }
  resetStopwatch() { this.stopwatchElapsed = 0; this.stopwatchRunning = false; this.stopStopwatchTick(); this.renderStopwatch(); }

  // TIMER
  renderTimer() {
    if (this.timerRunning && !this.timerIntervalId) this.startTimerTick();
    const total = Math.max(0, this.timerMs);
    const s = Math.floor(total/1000);
    const mm = String(Math.floor(s/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;">
        <div style="text-align:center;">
          <div style="font-size:24px;font-weight:bold;">${mm}:${ss}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:9px;font-weight:bold;">
          <div>${this.timerRunning? 'Pause':'Start'}</div><div>Adjust</div><div>Back</div>
        </div>
      </div>`;
  }
  adjustTimer(deltaSeconds) { this.timerMs = Math.max(0, this.timerMs + deltaSeconds*1000); this.renderTimer(); }
  toggleTimer() {
    if (!this.timerRunning && this.timerMs === 0) this.timerMs = 60*1000;
    this.timerRunning = !this.timerRunning;
    if (this.timerRunning) this.startTimerTick(); else this.stopTimerTick();
    this.renderTimer();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClockScreen;
} else {
  window.ClockScreen = ClockScreen;
}
