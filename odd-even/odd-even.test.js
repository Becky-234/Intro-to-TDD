const isOdd = require('./odd-even')

test('returns odd when for 1', () => {
    expect(isOdd(1)).toBe('odd')
});

test('require only number input', () => {
    expect(isOdd('Becky')).toBe('Please input a number')
});

test('returns even when for 2', () => {
    expect(isOdd(2)).toBe('even')
});


test('returns even when for 1000', () => {
    expect(isOdd(1000)).toBe('even')
});

test('returns odd when for 1001', () => {
    expect(isOdd(1001)).toBe('odd')
});