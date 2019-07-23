import { Debug } from './Debug.js';

function Warn (target) {
  if (!Debug.isEnabled()) return;
  console.warn('could not track element', target);
}

function PrintEvent(eventName) {
  if (!Debug.isEnabled()) return;
  console.log(`%c[YextAnalytics]%c- Fired event: ${eventName}`, 'color: blue;', 'color: black;');
}

export {
  PrintEvent
}
