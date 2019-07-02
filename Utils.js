import { Debug } from './Debug.js';
// import { CalcEventNameMap } from './Helpers.js';

// function PrintEvents () {
//   if (!Debug.isEnabled()) return;
//   for (const name of Array.from(CalcEventNameMap().keys())) {
//     console.log(name);
//   }
// }

function Warn (target) {
  if (!Debug.isEnabled()) return;
  console.warn('could not track element', target);
}

function PrintEvent(eventName) {
  if (!Debug.isEnabled()) return;
  console.log(`%c[YextAnalytics]%c- Fired event: ${eventName}`, 'color: blue;', 'color: black;');
}

export {
  PrintEvent,
  // PrintEvents,
  Warn
}
