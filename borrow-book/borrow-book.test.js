const borrow_book = require('./borrow-book');

describe('borrow_book function', () => {

    // Test 1: Borrowing a book that is available
    test('borrows a book that is available', () => {
        const availableBooks = ["Moby Dick", "1984", "Pride and Prejudice"];
        const result = borrow_book("1984", availableBooks);

        expect(result).toBe("You have borrowed '1984'.");
        expect(availableBooks).toEqual(["Moby Dick", "Pride and Prejudice"]);
    });

    // Test 2: Trying to borrow a book that is not available
    test('returns error when book is not available', () => {
        const availableBooks = ["Moby Dick", "Pride and Prejudice"];
        const result = borrow_book("The Hobbit", availableBooks);

        expect(result).toBe("Sorry, 'The Hobbit' is not available.");
        expect(availableBooks).toEqual(["Moby Dick", "Pride and Prejudice"]);
    });

    // Test 3: Checking that the book list updates correctly after borrowing
    test('removes borrowed book from available books list', () => {
        const availableBooks = ["Moby Dick", "1984", "Pride and Prejudice"];
        borrow_book("1984", availableBooks);

        expect(availableBooks).toEqual(["Moby Dick", "Pride and Prejudice"]);
        expect(availableBooks).not.toContain("1984");
    });

    // Test 4: Borrowing a book when the list is empty
    test('handles empty book list', () => {
        const availableBooks = [];
        const result = borrow_book("1984", availableBooks);

        expect(result).toBe("Sorry, '1984' is not available.");
        expect(availableBooks).toEqual([]);
    });
});