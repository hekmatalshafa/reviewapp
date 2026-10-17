import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, DEFAULT_SETTINGS } from '../src/utils.js';
import { getSettings } from '../src/db.js';
import { renderReviewPage } from '../src/templates/review.js';

test('short local numbers and Persian/Arabic digits normalize safely', () => {
  for (const value of ['0713302', '۰۷۱۳۳۰۲', '٠٧١٣٣٠٢', '(071) 33-02']) {
    assert.equal(normalizePhone(value), '0713302');
  }
  assert.equal(normalizePhone('+33 123456789'), '+33123456789');
  for (const value of ['123456', 'javascript:alert(1)', '0713302#']) assert.equal(normalizePhone(value), null);
});

test('existing empty settings use the clinic number and render a dialer link', async () => {
  const db = { prepare: () => ({ all: async () => ({ results: [{ key: 'business_phone', value: '' }] }) }) };
  const settings = await getSettings(db);
  assert.equal(settings.business_phone, '0713302');
  assert.match(renderReviewPage({ settings }), /href="tel:0713302"/);
  assert.match(renderReviewPage({ settings: { ...DEFAULT_SETTINGS, business_phone: '02112345678' } }), /href="tel:02112345678"/);
});
