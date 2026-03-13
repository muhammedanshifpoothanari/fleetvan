/**
 * useHaptics — Uber-style haptic feedback hook
 *
 * Uber uses three haptic tiers:
 *  - light:   Selection changed, tap feedback (Navigator.vibrate 10ms)
 *  - medium:  Confirm, complete action (20ms)
 *  - heavy:   Error, warning, shift start/end (40ms)
 *  - success: Stop completed, books balanced (pattern: 10,50,10)
 *  - error:   Issue submitted, cash short (pattern: 40,30,40)
 *
 * Falls back gracefully on devices without vibration support.
 */
export function useHaptics() {
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return {
    light:   () => vibrate(10),
    medium:  () => vibrate(20),
    heavy:   () => vibrate(40),
    success: () => vibrate([10, 50, 10]),
    error:   () => vibrate([40, 30, 40]),
    warning: () => vibrate([20, 30, 20]),
    tick:    () => vibrate(8),
  }
}
