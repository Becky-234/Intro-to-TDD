// utils.js
module.exports = {
    sum: (a, b) => a + b,

    createUser: (name, age) => ({
        name,
        age,
        createdAt: new Date(),
    }),

    filterAdults: (users) => users.filter(user => user.age >= 18),

    findInArray: (arr, value) => arr.indexOf(value) !== -1,

    parseJSON: (jsonString) => {
        if (!jsonString) {
            throw new Error('No JSON string provided');
        }
        return JSON.parse(jsonString);
    },

    approximateDivision: (a, b) => a / b,
};

