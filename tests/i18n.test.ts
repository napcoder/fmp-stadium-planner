import { getTranslator } from '../src/i18n';

describe('i18n getTranslator', () => {
  it('returns English by default', () => {
    const t = getTranslator('en');
    expect(t('maxIncomeCurrent')).toBe('Maximum income (current)');
  });

  it('returns Italian if specified', () => {
    const t = getTranslator('it');
    expect(t('maxIncomeCurrent')).toBe('Massimo incasso (attuale)');
  });

  it('returns key itself for unknown key', () => {
    const t = getTranslator('en');
    expect(t('unknown_key' as any)).toBe('unknown_key');
  });

  it('falls back to English if language not supported', () => {
    // @ts-expect-error: purposely passing unsupported lang
    const t = getTranslator('fr');
    expect(t('maxIncomeCurrent')).toBe('Maximum income (current)');
  });
});
