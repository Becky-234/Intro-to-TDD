function isOdd(num) {
    if (typeof num !== 'number') {
        return 'Please input a number'
    }
    if (num % 2 === 0) {
        return "even";
    } else {
        return "odd";
    }
}

module.exports = isOdd;
