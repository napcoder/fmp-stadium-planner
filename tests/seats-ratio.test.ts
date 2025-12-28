
import { SeatsRatio } from '../src/seats-ratio';

describe('SeatsRatio', () => {
	describe('getTotalWeight', () => {
		it('returns the sum of all seat types', () => {
			const ratio = new SeatsRatio({ vip: 1, covered: 4, standard: 8, standing: 16 });
			expect(ratio.getTotalWeight()).toBe(29);
		});
		it('returns 0 for all zero values', () => {
			const ratio = new SeatsRatio({ vip: 0, covered: 0, standard: 0, standing: 0 });
			expect(ratio.getTotalWeight()).toBe(0);
		});
	});

	describe('toString', () => {
		it('returns the correct string representation', () => {
			const ratio = new SeatsRatio({ vip: 2, covered: 3, standard: 5, standing: 7 });
			expect(ratio.toString()).toBe('2-3-5-7');
		});
		it('handles zeros correctly', () => {
			const ratio = new SeatsRatio({ vip: 0, covered: 1, standard: 0, standing: 2 });
			expect(ratio.toString()).toBe('0-1-0-2');
		});
	});
});
