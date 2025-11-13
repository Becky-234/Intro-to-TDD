module.exports = {
     sum: (a, b) => {
        if (a === null || b === null) {
            return null;
        }
        return a + b;
    },
    createUser: (name, age) => ({
        name,
        age,
        createdAt: new Date(),
    }),

    filterAdults: (users) => users.filter(user => user.age >= 18),

    findInArray: (arr, value) => arr.includes(value),

    parseJSON: (jsonString) => {
        if (!jsonString) {
            throw new Error('No JSON string provided');
        }
        return JSON.parse(jsonString);
    },

    approximateDivision: (a, b) => a / b,
};

