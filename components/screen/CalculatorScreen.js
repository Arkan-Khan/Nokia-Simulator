/**
 * CalculatorScreen - Simple classic Nokia-style calculator
 */

class CalculatorScreen {
  constructor(screenElement) {
    this.screenElement = screenElement;
    this.reset();
  }

  reset() {
    this.firstNumber = '';
    this.secondNumber = '';
    this.selectedOperator = null; // 'add' | 'sub' | 'mul' | 'div'
    this.isShowingResult = false;
  }

  render() {
    this.screenElement.innerHTML = `
      <div class="screen-content" style="background:#0b1b2b;color:#fff;">
        <!-- Top status bar (icons + time) -->
        <div class="calc-status" style="position:absolute;top:0;left:0;right:0;height:16px;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:space-between;padding:0 5px;font-size:10px;font-weight:bold;">
          <span>📶</span>
          <span>${new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',hour12:false})}</span>
          <span>🔋</span>
        </div>

        <!-- Number display (square edges, full row) -->
        <div class="calc-display" style="position:absolute;top:16px;left:0;right:0;height:44px;background:#ecd2b2;color:#000;padding:6px 8px;font-size:18px;font-weight:bold;overflow:hidden;display:flex;align-items:flex-end;justify-content:flex-end;font-family:'Nokia Sans', Arial, sans-serif;">
          ${this.getDisplayText()}
        </div>

        <!-- Circular operators (smaller, centered vertically with more padding above) -->
        <div class="calc-ops" style="position:absolute;left:50%;transform:translateX(-50%);top:92px;width:78px;height:78px;background:#2a5d8f;border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <div style="position:relative;width:100%;height:100%;">
            ${this.renderOperator('+','add', '50%', '14%')}
            ${this.renderOperator('−','sub', '50%', '86%')}
            ${this.renderOperator('×','mul', '18%', '50%')}
            ${this.renderOperator('÷','div', '82%', '50%')}
          </div>
        </div>

        <!-- Soft keys (shorter, Equals shifted right) -->
        <div class="calc-soft-keys" style="position:absolute;bottom:0;left:0;right:0;height:24px;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:flex-start;gap:8px;padding:0 6px;color:#fff;font-weight:bold;font-size:10px;">
          <div class="soft-key" style="min-width:40px;"></div>
          <div class="soft-key" style="margin-left:auto;margin-right:10px;">Equals</div>
          <div class="soft-key">Back</div>
        </div>
      </div>
    `;
  }

  renderOperator(symbol, key, leftPercent, topPercent) {
    const isFocused = this.selectedOperator === key;
    const color = isFocused ? '#ffff66' : '#ffffff';
    return `
      <div data-op="${key}" style="position:absolute;left:${leftPercent};top:${topPercent};transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;">
        <span style="color:${color}">${symbol}</span>
      </div>
    `;
  }

  getDisplayText() {
    if (this.isShowingResult) {
      return String(this.firstNumber);
    }
    if (this.selectedOperator) {
      return `${this.firstNumber} ${this.getOperatorSymbol(this.selectedOperator)} ${this.secondNumber}`.trim();
    }
    return this.firstNumber || '0';
  }

  getOperatorSymbol(op) {
    switch (op) {
      case 'add': return '+';
      case 'sub': return '−';
      case 'mul': return '×';
      case 'div': return '÷';
      default: return '';
    }
  }

  addDigit(d) {
    this.isShowingResult = false;
    const target = this.selectedOperator ? 'secondNumber' : 'firstNumber';
    if (this[target].length >= 12) return;
    if (d === '0' && this[target] === '0') return;
    if (this[target] === '0') {
      this[target] = d;
    } else {
      this[target] += d;
    }
    this.updateDisplay();
  }

  navigateOperator(direction) {
    // Map directions to operator
    const dirToOp = { up: 'add', down: 'sub', left: 'mul', right: 'div' };
    const op = dirToOp[direction];
    if (!op) return;
    this.selectedOperator = op;
    this.isShowingResult = false;
    this.updateDisplay();
  }

  equals() {
    if (!this.firstNumber || !this.selectedOperator || !this.secondNumber) return;
    const a = parseFloat(this.firstNumber);
    const b = parseFloat(this.secondNumber);
    let res = 0;
    switch (this.selectedOperator) {
      case 'add': res = a + b; break;
      case 'sub': res = a - b; break;
      case 'mul': res = a * b; break;
      case 'div': res = b === 0 ? 0 : a / b; break;
    }
    // Prepare for chaining: result becomes first number
    this.firstNumber = String(Number.isFinite(res) ? +res.toFixed(6) : 0);
    this.secondNumber = '';
    this.selectedOperator = null;
    this.isShowingResult = true;
    this.updateDisplay();
  }

  updateDisplay() {
    // Simply re-render for consistency and alignment
    this.render();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalculatorScreen;
} else {
  window.CalculatorScreen = CalculatorScreen;
}


