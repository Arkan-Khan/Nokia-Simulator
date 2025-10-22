/**
 * PhoneState - Manages the phone's operational state and enforces valid state transitions
 * 
 * States: POWERED_OFF, BOOTING, HOME_SCREEN, POWERING_OFF
 * Valid transitions: POWERED_OFF → BOOTING → HOME_SCREEN → POWERING_OFF → POWERED_OFF
 */

const PhoneStates = Object.freeze({
  POWERED_OFF: 'POWERED_OFF',
  BOOTING: 'BOOTING', 
  HOME_SCREEN: 'HOME_SCREEN',
  MENU: 'MENU',
  DIALER: 'DIALER',
  CALLING: 'CALLING',
  CALCULATOR: 'CALCULATOR',
  CAMERA: 'CAMERA',
  GALLERY: 'GALLERY',
  CALLS: 'CALLS',
  POWERING_OFF: 'POWERING_OFF'
});

class PhoneState {
  constructor() {
    this.currentState = PhoneStates.POWERED_OFF;
    this.stateHistory = [];
    
    // Valid state transitions
    this.transitions = {
      [PhoneStates.POWERED_OFF]: [PhoneStates.BOOTING],
      [PhoneStates.BOOTING]: [PhoneStates.HOME_SCREEN],
      [PhoneStates.HOME_SCREEN]: [PhoneStates.MENU, PhoneStates.DIALER, PhoneStates.CALCULATOR, PhoneStates.CAMERA, PhoneStates.GALLERY, PhoneStates.CALLS, PhoneStates.POWERING_OFF],
      [PhoneStates.MENU]: [PhoneStates.HOME_SCREEN, PhoneStates.CALCULATOR, PhoneStates.CAMERA, PhoneStates.GALLERY, PhoneStates.CALLS],
      [PhoneStates.DIALER]: [PhoneStates.HOME_SCREEN, PhoneStates.CALLING],
      [PhoneStates.CALLING]: [PhoneStates.DIALER, PhoneStates.HOME_SCREEN],
      [PhoneStates.CALCULATOR]: [PhoneStates.MENU, PhoneStates.HOME_SCREEN],
      [PhoneStates.CAMERA]: [PhoneStates.MENU, PhoneStates.HOME_SCREEN, PhoneStates.GALLERY],
      [PhoneStates.GALLERY]: [PhoneStates.MENU, PhoneStates.HOME_SCREEN, PhoneStates.CAMERA],
      [PhoneStates.CALLS]: [PhoneStates.MENU, PhoneStates.HOME_SCREEN],
      [PhoneStates.POWERING_OFF]: [PhoneStates.POWERED_OFF]
    };
  }

  /**
   * Get current phone state
   * @returns {string} Current state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Check if transition to target state is valid
   * @param {string} targetState - Target state
   * @returns {boolean} True if transition is valid
   */
  canTransition(targetState) {
    const validTransitions = this.transitions[this.currentState] || [];
    return validTransitions.includes(targetState);
  }

  /**
   * Set state directly (for initialization/restoration)
   * @param {string} newState - Target state
   * @returns {boolean} True if state is valid
   */
  setState(newState) {
    if (!Object.values(PhoneStates).includes(newState)) {
      console.error(`[STATE] Invalid state: ${newState}`);
      return false;
    }
    
    this.stateHistory.push(this.currentState);
    this.currentState = newState;
    return true;
  }

  /**
   * Transition to new state with validation
   * @param {string} newState - Target state
   * @returns {boolean} True if transition successful
   */
  transitionTo(newState) {
    if (!this.canTransition(newState)) {
      console.error(`[STATE] Invalid transition: ${this.currentState} → ${newState}`);
      return false;
    }
    
    this.stateHistory.push(this.currentState);
    
    // Limit history to prevent memory leak
    if (this.stateHistory.length > 10) {
      this.stateHistory.shift();
    }
    
    this.currentState = newState;
    return true;
  }

  /**
   * Reset to powered off state
   */
  reset() {
    this.currentState = PhoneStates.POWERED_OFF;
    this.stateHistory = [];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PhoneState, PhoneStates };
} else {
  window.PhoneState = PhoneState;
  window.PhoneStates = PhoneStates;
}
