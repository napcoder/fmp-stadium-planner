import { getTranslator } from '../src/i18n';

describe('i18n getTranslator', () => {
  it('returns English by default', () => {
    const t = getTranslator('en');
    expect(t('maxIncome')).toBe('Maximum income:');
  });

  it('returns Italian if specified', () => {
    const t = getTranslator('it');
    expect(t('maxIncome')).toBe('Massimo incasso:');
  });

  it('returns key itself for unknown key', () => {
    const t = getTranslator('en');
    expect(t('unknown_key' as any)).toBe('unknown_key');
  });

  it('falls back to English if language not supported', () => {
    // @ts-expect-error: purposely passing unsupported lang
    const t = getTranslator('fr');
    expect(t('maxIncome')).toBe('Maximum income:');
  });
});
