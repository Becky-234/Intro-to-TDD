const { sum } = require('./utils');
const { createUser } = require('./utils');
const { parseJSON } = require('./utils');
 const { findInArray } = require('./utils');
const { approximateDivision } = require('./utils');

// Exact equality
test('returns 4 for sum of 2 and 2', () => {
    expect(sum(2, 2)).toBe(4);
});

test('createUser returns correct name and age at correct date', () => {
 const mockDate = new Date('2025-06-11');
 jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    const result = createUser('Becky', 20);
    expect(result).toEqual({
        name: 'Becky',
        age: 20,
        createdAt: mockDate
    });
    global.Date.mockRestore();
});

test('simple toEqual vs toStrictEqual with sum', () => {
    const result = sum(3, 4);
    expect(result).toEqual(7);
    expect(result).toEqual(7);
});

// toStrictEqual difference
 test('toEqual passes but toStrictEqual fails (extra undefined property)', () => {
    const obj1 = { a: 1, b: undefined };
     const obj2 = { a: 1 };
    expect(obj1).toEqual(obj2);          //passes
    expect(obj1).not.toStrictEqual(obj2); //shows difference
});

// Negation (not)
test('sum(1,1) is not 3', () => {
expect(sum(1, 1)).not.toBe(3);
});

 test('sum(1,1) is not greater than 10', () => {
    expect(sum(1, 1)).not.toBeGreaterThan(10);
});

test('sum(1,1) is not null', () => {
    expect(sum(1, 1)).not.toBeNull();
});

test('sum(1,1) is not greater/ less than 0', () => {
    expect(sum(1, 1)).not.toBeLessThan(0);
    expect(sum(1, 1)).not.toBeGreaterThan(10);
});

// Truthiness
test('sum is null with null inputs',() => {
    expect(sum(null, 1)).toBeNull();
    expect(sum(1, null)).toBeNull();
});

test('createUser is defined',() => {
    expect(createUser('Becky', 20)).toBeDefined();
});

test('function with no return gives undefined',() => {
    function noReturn() { }
    expect(noReturn()).toBeUndefined();
});

test('findInArray returns truthy if value is found', () => {
    expect(findInArray([1, 2, 3], 2)).toBeTruthy();
});

test('findInArray returns falsy if value is not found', () => {
    expect(findInArray([1, 2, 3], 4)).toBeFalsy();
});

// Number matchers
test('sum(2, 3) is greater than 4', () => {
    expect(sum(2, 3)).toBeGreaterThan(4);
});

test('sum(2, 3) is greater than or equal to 5', () => {
    expect(sum(2, 3)).toBeGreaterThanOrEqual(5);
});

test('approximateDivision(10, 2) is less than or equal to 5', () => {
    expect(approximateDivision(10, 2)).toBeLessThanOrEqual(5);
});

test('approximateDivision(10, 2) is less than 6',() => {
    expect(approximateDivision(10, 2)).toBeLessThan(6);
});

test('approximateDivision(0.3, 0.1) is close to 3', () => {
    expect(approximateDivision(0.3, 0.1)).toBeCloseTo(3);
});

// String / Regex matchers
test('createUser name matches regex (pass)', () => {
    const user = createUser('Alison', 21);
    expect(user.name).toMatch(/^[A-Z][a-z]+$/);
});

test('createUser name fails regex (fail)', () => {
    const user = createUser('alison', 21);
    expect(user.name).toMatch(/^[A-Z][a-z]+$/);
});

test('JSON string of user contains the name', () => {
    const user = createUser('Benja', 33);
    const jsonString = JSON.stringify(user);
    expect(jsonString).toMatch(/"Benja"/);
});

test('JSON string of user does not contain password field', () => {
    const user = createUser('Charlie', 22);
    const jsonString = JSON.stringify(user);
    expect(jsonString).not.toMatch(/password/);
});

test('JSON string incorrectly expected to contain password (fail)', () => {
    const user = createUser('Charlie', 22);
    const jsonString = JSON.stringify(user);
    expect(jsonString).toMatch(/password/);
});

// Arrays and Iterables
test('array contains a specific value', () => {
    const numbers = [1, 2, 3, 4];
    expect(numbers).toContain(3);
});

test('array does not contain value (fail)', () => {
    const numbers = [1, 2, 3, 4];
    expect(numbers).not.toContain(5);
});

test('set contains a value', () => {
    const userSet = new Set(['Alex', 'Bella', 'Chris']);
    expect(userSet).toContain('Bella');
});

test('set does not contain a value (fail)', () => {
    const userSet = new Set(['Alex', 'Bella', 'Chris']);
    expect(userSet).toContain('David');
});

// // Exceptions
// test('parseJSON throws error with invalid JSON', () => {
//     expect(() => parseJSON('invalid json')).toThrow();
// });

// test('parseJSON throws with specific message', () => {
//     expect(() => parseJSON('')).toThrow('No JSON string provided');
// });

// test('parseJSON does not throw for valid JSON (fail)', () => {
//     expect(() => parseJSON('{"valid":true}')).toThrow();
// });
