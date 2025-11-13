function borrow_book(book_title, available_books) {

    const bookIndex = available_books.indexOf(book_title);


    if (bookIndex !== -1) {
        // Book is available, remove it from available books
        available_books.splice(bookIndex, 1);
        return `You have borrowed '${book_title}'.`;
    } else {
        // Book is not available
        return `Sorry, '${book_title}' is not available.`;
    }
}

module.exports = borrow_book;