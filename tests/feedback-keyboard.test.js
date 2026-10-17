import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { renderReviewPage } from '../src/templates/review.js';
import { DEFAULT_SETTINGS } from '../src/utils.js';

function harness(withViewport = true) {
  const listeners = new Map();
  const properties = {};
  let document;
  const element = (id) => ({
    id, hidden: false, style: {}, scrollTop: 0, value: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener(type, fn) { listeners.set(`${id}:${type}`, fn); },
    getAttribute(name) { return this[name] || ''; },
    setAttribute(name, value) { this[name] = value; },
    focus() { document.activeElement = this; },
    blur() { document.activeElement = null; },
    contains(node) { return node === handle || node === textarea; },
    matches(selector) { return this === textarea && selector === 'textarea,input'; },
    getBoundingClientRect() { return { top: 0, bottom: 400 }; },
  });
  const handle = element('handle');
  const textarea = element('textarea');
  const feedback = element('feedback');
  feedback.hidden = true;
  feedback.querySelector = (selector) => selector === '.sheet-handle' ? handle : textarea;
  const stars = Array.from({ length: 5 }, (_, i) => Object.assign(element(`star${i}`), { value: String(i + 1), 'data-rating': String(i + 1) }));
  const form = element('rating-form');
  form.querySelectorAll = () => stars;
  form.querySelector = () => stars[2];
  const elements = { 'rating-form': form, feedback, thanks: element('thanks'), ask: element('ask'), hint: element('hint'), 'fb-rating': element('rating'), live: element('live') };
  document = {
    activeElement: null,
    documentElement: { style: { setProperty(key, value) { properties[key] = value; } } },
    getElementById(id) { return elements[id] || null; },
  };
  const viewport = { height: 800, offsetTop: 0, addEventListener(type, fn) { listeners.set(`viewport:${type}`, fn); } };
  const window = {
    innerHeight: 800, visualViewport: withViewport ? viewport : undefined,
    matchMedia(query) { return { matches: query.includes('reduced-motion') }; },
    requestAnimationFrame(fn) { fn(); },
    addEventListener(type, fn) { listeners.set(`window:${type}`, fn); },
  };
  const html = renderReviewPage({ settings: DEFAULT_SETTINGS });
  const script = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(script, { window, document, navigator: {}, setTimeout(fn) { fn(); } });
  return { listeners, properties, window, viewport, document, feedback, handle, textarea, stars };
}

test('opening low-rating feedback focuses a non-editable handle, not the textarea', () => {
  const app = harness();
  app.listeners.get('rating-form:submit')({ submitter: app.stars[2], preventDefault() {} });
  assert.equal(app.feedback.hidden, false);
  assert.equal(app.document.activeElement, app.handle);
  assert.notEqual(app.document.activeElement, app.textarea);
});

test('keyboard viewport changes resize and reposition the sheet, then restore it', () => {
  const app = harness();
  app.feedback.hidden = false;
  app.textarea.focus();
  app.textarea.getBoundingClientRect = () => ({ top: 320, bottom: 450 });
  app.viewport.height = 420;
  app.listeners.get('viewport:resize')();
  assert.equal(app.properties['--sheet-visible-height'], '420px');
  assert.equal(app.properties['--sheet-bottom'], '380px');
  assert.equal(app.feedback.scrollTop, 70);
  app.viewport.height = 800;
  app.textarea.blur();
  app.listeners.get('viewport:resize')();
  assert.equal(app.properties['--sheet-bottom'], '0px');
  assert.equal(app.properties['--sheet-visible-height'], '800px');
});

test('viewport offset and browsers without VisualViewport are supported', () => {
  const app = harness();
  app.viewport.height = 420;
  app.viewport.offsetTop = 30;
  app.listeners.get('viewport:scroll')();
  assert.equal(app.properties['--sheet-bottom'], '350px');
  const fallback = harness(false);
  fallback.window.innerHeight = 450;
  fallback.listeners.get('window:resize')();
  assert.equal(fallback.properties['--sheet-visible-height'], '450px');
  assert.equal(fallback.properties['--sheet-bottom'], '0px');
});
