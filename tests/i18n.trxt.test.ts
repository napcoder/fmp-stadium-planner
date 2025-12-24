import { getHostLabel } from '../src/i18n';

describe('i18n getHostLabel with window.trxt', () => {
  afterEach(() => {
    // cleanup host global
    // @ts-ignore
    delete (global as any).trxt;
  });

  it('returns the label itself when trxt is not present', () => {
    // ensure trxt absent
    // @ts-ignore
    delete (global as any).trxt;
    expect(getHostLabel('maxIncome')).toBe('maxIncome');
  });

  it('returns host value for direct key', () => {
    // @ts-ignore
    (global as any).trxt = { maxIncome: 'Maximum host income' };
    expect(getHostLabel('maxIncome')).toBe('Maximum host income');
  });

  it('returns host value for prefixed key that ends with label', () => {
    // @ts-ignore
    (global as any).trxt = { 'stadium.maxIncome': 'Maximum host income with prefix', other: 'x' };
    expect(getHostLabel('stadium.maxIncome')).toBe('Maximum host income with prefix');
  });

  it('returns proper host value when 3 prefixed keys presents ending in the same way', () => {
    // @ts-ignore
    (global as any).trxt = {
        'wrong.maxIncome': 'Wrong maximum income',
        'stadium.maxIncome': 'Maximum host income with prefix',
        'wrong2.maxIncome': 'Also wrong maximum income',
        other: 'x'
    };
    expect(getHostLabel('stadium.maxIncome')).toBe('Maximum host income with prefix');
  });
});
