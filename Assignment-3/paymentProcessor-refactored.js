// Configuration constants
const DISCOUNT_CODES = {
    SUMMER20: { type: 'percentage', value: 0.2 },
    WELCOME10: { type: 'fixed', value: 10 }
};

const FRAUD_THRESHOLDS = {
    LIGHT_CHECK_LIMIT: 100,
    VERY_LOW_RISK: 10,
    HIGH_RISK: 1000
};

const FEES = {
    CURRENCY_CONVERSION_RATE: 1.2,
    REFUND_FEE_PERCENTAGE: 0.05
};

// PaymentMethod validator classes
class PaymentMethodValidator {
    validate(metadata) {
        throw new Error('validate() must be implemented');
    }
}

class CreditCardValidator extends PaymentMethodValidator {
    validate(metadata) {
        if (!metadata.cardNumber || !metadata.expiry) {
            throw new Error("Invalid card metadata");
        }
    }
}

class PayPalValidator extends PaymentMethodValidator {
    validate(metadata) {
        if (!metadata.paypalAccount) {
            throw new Error("Invalid PayPal metadata");
        }
    }
}

// Payment method factory
class PaymentMethodFactory {
    static getValidator(paymentMethod) {
        const validators = {
            credit_card: new CreditCardValidator(),
            paypal: new PayPalValidator()
        };

        const validator = validators[paymentMethod];
        if (!validator) {
            throw new Error("Unsupported payment method");
        }
        return validator;
    }

    static getApiEndpoint(paymentMethod) {
        const endpoints = {
            credit_card: '/payments/credit',
            paypal: '/payments/paypal'
        };
        return endpoints[paymentMethod];
    }
}

// Discount calculator
class DiscountCalculator {
    static apply(amount, discountCode) {
        if (!discountCode) {
            return amount;
        }

        const discount = DISCOUNT_CODES[discountCode];
        if (!discount) {
            console.log("Unknown discount code");
            return amount;
        }

        if (discount.type === 'percentage') {
            return amount * (1 - discount.value);
        } else if (discount.type === 'fixed') {
            return amount - discount.value;
        }

        return amount;
    }
}

// Currency converter
class CurrencyConverter {
    static convert(amount, currency) {
        if (currency === "USD") {
            return amount;
        }
        return amount * FEES.CURRENCY_CONVERSION_RATE;
    }
}

// Fraud checker
class FraudChecker {
    check(userId, amount, fraudCheckLevel) {
        if (fraudCheckLevel === 0) {
            return;
        }

        if (amount < FRAUD_THRESHOLDS.LIGHT_CHECK_LIMIT) {
            this._performLightCheck(userId, amount);
        } else {
            this._performHeavyCheck(userId, amount);
        }
    }

    _performLightCheck(userId, amount) {
        console.log("Performing light fraud check for small payment");
        this._logRiskLevel(userId, amount, FRAUD_THRESHOLDS.VERY_LOW_RISK, 'Very low risk', 'Low risk');
    }

    _performHeavyCheck(userId, amount) {
        console.log("Performing heavy fraud check for large payment");
        this._logRiskLevel(userId, amount, FRAUD_THRESHOLDS.HIGH_RISK, 'High risk', 'Medium risk');
    }

    _logRiskLevel(userId, amount, threshold, aboveMessage, belowMessage) {
        console.log(`${aboveMessage.includes('Heavy') ? 'Heavy' : 'Light'} fraud check for user ${userId} on amount ${amount}`);
        if (amount >= threshold) {
            console.log(aboveMessage);
        } else {
            console.log(belowMessage);
        }
    }
}

// Transaction builder
class TransactionBuilder {
    constructor() {
        this.transaction = {};
    }

    withUserId(userId) {
        this.transaction.userId = userId;
        return this;
    }

    withAmounts(originalAmount, finalAmount) {
        this.transaction.originalAmount = originalAmount;
        this.transaction.finalAmount = finalAmount;
        return this;
    }

    withCurrency(currency) {
        this.transaction.currency = currency;
        return this;
    }

    withPaymentMethod(paymentMethod) {
        this.transaction.paymentMethod = paymentMethod;
        return this;
    }

    withMetadata(metadata) {
        this.transaction.metadata = metadata;
        return this;
    }

    withDiscountCode(discountCode) {
        this.transaction.discountCode = discountCode;
        return this;
    }

    withFraudCheck(fraudCheckLevel) {
        this.transaction.fraudChecked = fraudCheckLevel;
        return this;
    }

    withTimestamp() {
        this.transaction.timestamp = new Date().toISOString();
        return this;
    }

    build() {
        return this.transaction;
    }
}

// Email service (separated concern)
class EmailService {
    sendConfirmationEmail(userId, amount, currency) {
        console.log(
            `Sending email to user ${userId}: Your payment of ${amount} ${currency} was successful.`
        );
    }
}

// Analytics service (separated concern)
class AnalyticsService {
    logEvent(data) {
        console.log("Analytics event:", data);
    }
}

// Main PaymentProcessor class
class PaymentProcessor {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.currencyConversionRate = FEES.CURRENCY_CONVERSION_RATE;
        this.fraudChecker = new FraudChecker();
        this.emailService = new EmailService();
        this.analyticsService = new AnalyticsService();
    }

    processPayment(
        amount,
        currency,
        userId,
        paymentMethod,
        metadata,
        discountCode,
        fraudCheckLevel
    ) {
        // Validate payment method
        const validator = PaymentMethodFactory.getValidator(paymentMethod);
        validator.validate(metadata);

        // Perform fraud check
        this.fraudChecker.check(userId, amount, fraudCheckLevel);

        // Calculate final amount
        const finalAmount = this._calculateFinalAmount(amount, currency, discountCode);

        // Build transaction
        const transaction = new TransactionBuilder()
            .withUserId(userId)
            .withAmounts(amount, finalAmount)
            .withCurrency(currency)
            .withPaymentMethod(paymentMethod)
            .withMetadata(metadata)
            .withDiscountCode(discountCode)
            .withFraudCheck(fraudCheckLevel)
            .withTimestamp()
            .build();

        // Process payment through API
        this._sendToApi(paymentMethod, transaction);

        // Post-processing
        this._sendConfirmationEmail(userId, finalAmount, currency);
        this._logAnalytics({ userId, amount: finalAmount, currency, method: paymentMethod });

        return transaction;
    }

    _calculateFinalAmount(amount, currency, discountCode) {
        let finalAmount = DiscountCalculator.apply(amount, discountCode);
        finalAmount = CurrencyConverter.convert(finalAmount, currency);
        return finalAmount;
    }

    _sendToApi(paymentMethod, transaction) {
        try {
            const endpoint = PaymentMethodFactory.getApiEndpoint(paymentMethod);
            this.apiClient.post(endpoint, transaction);
            console.log("Payment sent to API:", transaction);
        } catch (err) {
            console.error("Failed to send payment:", err);
            throw err;
        }
    }

    // Backward compatibility methods (for tests)
    _lightFraudCheck(userId, amount) {
        console.log(`Light fraud check for user ${userId} on amount ${amount}`);
        if (amount < FRAUD_THRESHOLDS.VERY_LOW_RISK) {
            console.log("Very low risk");
        } else {
            console.log("Low risk");
        }
    }

    _heavyFraudCheck(userId, amount) {
        console.log(`Heavy fraud check for user ${userId} on amount ${amount}`);
        if (amount < FRAUD_THRESHOLDS.HIGH_RISK) {
            console.log("Medium risk");
        } else {
            console.log("High risk");
        }
    }

    _sendConfirmationEmail(userId, amount, currency) {
        this.emailService.sendConfirmationEmail(userId, amount, currency);
    }

    _logAnalytics(data) {
        this.analyticsService.logEvent(data);
    }

    refundPayment(transactionId, userId, reason, amount, currency, metadata) {
        const refundFee = amount * FEES.REFUND_FEE_PERCENTAGE;

        const refund = {
            transactionId,
            userId,
            reason,
            amount,
            currency,
            metadata,
            date: new Date(),
            netAmount: amount - refundFee
        };

        this.apiClient.post("/payments/refund", refund);
        console.log("Refund processed:", refund);

        return refund;
    }
}

// Export for use
module.exports = PaymentProcessor;