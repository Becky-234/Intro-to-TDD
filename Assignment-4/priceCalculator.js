
class PriceCalculator {
    constructor(taxService) {
        this.taxService = taxService;
    }

    totalPrice(amount) {
        const taxRate = this.taxService.getTaxRate();
        return amount + amount * taxRate;
    }
}

module.exports = PriceCalculator;





