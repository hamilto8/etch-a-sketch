/**
 * Physical Device Shake Detection Engine (DeviceMotion API)
 * Monitors mobile accelerometer data to clear the canvas when the user physically shakes their tablet or phone.
 */

import { clearScreen } from './grid.js';

// Physics thresholds for shake detection
const SHAKE_THRESHOLD = 25; // m/s^2 change required to trigger shake
const COOLDOWN_MS = 1500;   // Cooldown period between shake-triggered clears

let lastX = null;
let lastY = null;
let lastZ = null;
let lastShakeTime = 0;
let isListening = false;

/**
 * Handle accelerometer devicemotion events
 */
function handleDeviceMotion(e) {
  const acc = e.accelerationIncludingGravity || e.acceleration;
  if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

  const { x, y, z } = acc;

  if (lastX !== null && lastY !== null && lastZ !== null) {
    const deltaX = Math.abs(x - lastX);
    const deltaY = Math.abs(y - lastY);
    const deltaZ = Math.abs(z - lastZ);
    const totalChange = deltaX + deltaY + deltaZ;

    const now = Date.now();
    if (totalChange > SHAKE_THRESHOLD && (now - lastShakeTime) > COOLDOWN_MS) {
      lastShakeTime = now;
      clearScreen();
    }
  }

  lastX = x;
  lastY = y;
  lastZ = z;
}

/**
 * Request permission on iOS 13+ and attach accelerometer listener
 */
export function initShakeToErase() {
  if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;
  if (isListening) return;

  // On iOS 13+ devices, requesting DeviceMotionEvent permissions requires a direct user gesture.
  // We attach listeners to the document to cleanly request permission on the first interaction.
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    const requestIOSPermission = () => {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted' && !isListening) {
            isListening = true;
            window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
          }
        })
        .catch(err => {
          console.warn('DeviceMotion permission denied or ignored:', err);
        });

      window.removeEventListener('pointerdown', requestIOSPermission);
      window.removeEventListener('touchend', requestIOSPermission);
      window.removeEventListener('click', requestIOSPermission);
    };

    window.addEventListener('pointerdown', requestIOSPermission, { once: true });
    window.addEventListener('touchend', requestIOSPermission, { once: true });
    window.addEventListener('click', requestIOSPermission, { once: true });
  } else {
    // Standard mobile browsers (Android Chrome, Firefox, etc.) allow devicemotion immediately
    isListening = true;
    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
  }
}
