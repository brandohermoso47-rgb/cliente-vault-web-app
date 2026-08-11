/**
 * Helper utility to trigger device vibration (haptic feedback) and visual flash
 * when BPM hits exact multiples of 10 (e.g., 60, 70, 80, 90, 100, 110, 120, 130, 140...).
 */

export function triggerBpm10HapticAndFlash(
  bpm: number,
  enabled: boolean = true,
  onFlashTrigger?: () => void
): boolean {
  if (!enabled) return false;

  const isMultipleOf10 = bpm > 0 && bpm % 10 === 0;

  if (isMultipleOf10) {
    // 1. Mobile Vibration Haptic Feedback (if browser & hardware supported)
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      try {
        // Double-tap pulse pattern for tactile rhythm confirmation
        navigator.vibrate([60, 40, 90]);
      } catch (err) {
        console.warn('Haptic vibration failed or non-permitted:', err);
      }
    }

    // 2. Trigger Visual Flash callback
    if (onFlashTrigger) {
      onFlashTrigger();
    }

    return true;
  }

  return false;
}

export const STORAGE_KEY_BPM_HAPTIC = 'waackon_bpm_haptic_flash_enabled';

export function getBpmHapticPreference(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(STORAGE_KEY_BPM_HAPTIC);
  return saved !== null ? saved === 'true' : true;
}

export function setBpmHapticPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_BPM_HAPTIC, enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('bpm-haptic-preference-changed', { detail: { enabled } }));
}

export function testHapticVibration(): boolean {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([70, 50, 70]);
      return true;
    } catch (e) {
      console.warn('Vibration test failed or blocked by device:', e);
    }
  }
  return false;
}
