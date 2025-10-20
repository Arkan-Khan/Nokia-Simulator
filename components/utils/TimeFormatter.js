/**
 * TimeFormatter - Time and date formatting utilities for home screen
 */

const TimeFormatter = {
  /**
   * Get current time formatted for display
   * @param {boolean} is24Hour - Use 24-hour format
   * @returns {string} Formatted time (HH:MM or H:MM AM/PM)
   */
  getCurrentTime(is24Hour = true) {
    const now = new Date();
    return this.formatTime(now, is24Hour);
  },

  /**
   * Get current date formatted for Nokia display
   * @returns {string} Formatted date (e.g., "Monday 20.10")
   */
  getCurrentDate() {
    const now = new Date();
    return this.formatDate(now);
  },

  /**
   * Format time for display
   * @param {Date} date - Date object
   * @param {boolean} is24Hour - Use 24-hour format
   * @returns {string} Formatted time
   */
  formatTime(date, is24Hour = true) {
    if (is24Hour) {
      return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  },

  /**
   * Format date for Nokia 5130 style display
   * @param {Date} date - Date object
   * @returns {string} Formatted date (e.g., "Monday 20.10")
   */
  formatDate(date) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return `${dayName} ${day}.${month}`;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimeFormatter;
} else {
  window.TimeFormatter = TimeFormatter;
}
