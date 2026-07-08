const math = require('../src/math');

describe('Math Utility Functions', () => {
  describe('add', () => {
    it('should add two positive numbers correctly', () => {
      expect(math.add(2, 3)).toBe(5);
    });

    it('should handle negative numbers correctly', () => {
      expect(math.add(-2, -3)).toBe(-5);
      expect(math.add(5, -3)).toBe(2);
    });

    it('should handle floating point precision correctly', () => {
      expect(math.add(0.1, 0.2)).toBeCloseTo(0.3, 5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers correctly', () => {
      expect(math.subtract(10, 4)).toBe(6);
      expect(math.subtract(2, 5)).toBe(-3);
    });

    it('should handle subtraction resulting in float values', () => {
      expect(math.subtract(5.5, 2.1)).toBeCloseTo(3.4, 5);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      expect(math.multiply(3, 4)).toBe(12);
      expect(math.multiply(-3, 4)).toBe(-12);
      expect(math.multiply(5, 0)).toBe(0);
    });

    it('should handle multiplying floating point numbers', () => {
      expect(math.multiply(0.5, 0.2)).toBeCloseTo(0.1, 5);
    });
  });

  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      expect(math.divide(12, 3)).toBe(4);
      expect(math.divide(5, 2)).toBe(2.5);
    });

    it('should divide zero by any non-zero number', () => {
      expect(math.divide(0, 10)).toBe(0);
    });

    it('should handle division by a negative number', () => {
      expect(math.divide(10, -2)).toBe(-5);
    });

    it('should throw an error when dividing by zero', () => {
      expect(() => {
        math.divide(10, 0);
      }).toThrow('Cannot divide by zero');
    });
  });
});
