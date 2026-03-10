/**
 * Polyfills for cafe-admin application
 * This file includes polyfills needed for Node.js modules in the browser
 */

import 'zone.js';
import '@angular/localize/init';

// Set up global environment for Node.js-like modules
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {}, browser: true };
}

// Buffer polyfill is provided by the buffer package
import { Buffer } from 'buffer';
if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = Buffer;
}
