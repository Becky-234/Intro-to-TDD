
const PriceCalculator = require('./priceCalculator');

test('totalPrice uses stubbed tax rate', () => {
    // create stub
    const taxServiceStub = {
        getTaxRate: () => 0.20
    };

    const calculator = new PriceCalculator(taxServiceStub);

    const result = calculator.totalPrice(100);

    expect(result).toBe(120);
});




