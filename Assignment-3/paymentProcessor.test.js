const paymentProcessor = require('./paymentProcessor');

describe('PaymentProcessor', () => {
    let paymentProcessor;
    let mockApiClient;

    beforeEach(() => {
        // Create mock API client
        mockApiClient = {
            post: jest.fn().mockResolvedValue({ success: true })
        };

        paymentProcessor = new PaymentProcessor(mockApiClient);

        // Spy on console methods
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with apiClient and default currency conversion rate', () => {
            expect(paymentProcessor.apiClient).toBe(mockApiClient);
            expect(paymentProcessor.currencyConversionRate).toBe(1.2);
        });
    });

    describe('processPayment - Credit Card', () => {
        it('should process a valid credit card payment', () => {
            const result = paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                0
            );

            expect(result).toMatchObject({
                userId: 'user123',
                originalAmount: 100,
                finalAmount: 100,
                currency: 'USD',
                paymentMethod: 'credit_card'
            });
            expect(mockApiClient.post).toHaveBeenCalledWith(
                '/payments/credit',
                expect.any(Object)
            );
        });

        it('should throw error for credit card without cardNumber', () => {
            expect(() => {
                paymentProcessor.processPayment(
                    100,
                    'USD',
                    'user123',
                    'credit_card',
                    { expiry: '12/25' },
                    null,
                    0
                );
            }).toThrow('Invalid card metadata');
        });

        it('should throw error for credit card without expiry', () => {
            expect(() => {
                paymentProcessor.processPayment(
                    100,
                    'USD',
                    'user123',
                    'credit_card',
                    { cardNumber: '4111111111111111' },
                    null,
                    0
                );
            }).toThrow('Invalid card metadata');
        });
    });

    describe('processPayment - PayPal', () => {
        it('should process a valid PayPal payment', () => {
            const result = paymentProcessor.processPayment(
                50,
                'USD',
                'user456',
                'paypal',
                { paypalAccount: 'user@example.com' },
                null,
                0
            );

            expect(result).toMatchObject({
                userId: 'user456',
                originalAmount: 50,
                finalAmount: 50,
                currency: 'USD',
                paymentMethod: 'paypal'
            });
            expect(mockApiClient.post).toHaveBeenCalledWith(
                '/payments/paypal',
                expect.any(Object)
            );
        });

        it('should throw error for PayPal without paypalAccount', () => {
            expect(() => {
                paymentProcessor.processPayment(
                    50,
                    'USD',
                    'user456',
                    'paypal',
                    {},
                    null,
                    0
                );
            }).toThrow('Invalid PayPal metadata');
        });
    });

    describe('processPayment - Unsupported Payment Method', () => {
        it('should throw error for unsupported payment method', () => {
            expect(() => {
                paymentProcessor.processPayment(
                    100,
                    'USD',
                    'user123',
                    'bitcoin',
                    {},
                    null,
                    0
                );
            }).toThrow('Unsupported payment method');
        });
    });

    describe('processPayment - Fraud Check', () => {
        it('should perform light fraud check for small payment', () => {
            paymentProcessor.processPayment(
                50,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                1
            );

            expect(console.log).toHaveBeenCalledWith(
                'Performing light fraud check for small payment'
            );
        });

        it('should perform heavy fraud check for large payment', () => {
            paymentProcessor.processPayment(
                200,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                1
            );

            expect(console.log).toHaveBeenCalledWith(
                'Performing heavy fraud check for large payment'
            );
        });

        it('should skip fraud check when fraudCheckLevel is 0', () => {
            paymentProcessor.processPayment(
                200,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                0
            );

            expect(console.log).not.toHaveBeenCalledWith(
                expect.stringContaining('fraud check')
            );
        });
    });

    describe('processPayment - Discount Codes', () => {
        it('should apply SUMMER20 discount (20% off)', () => {
            const result = paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                'SUMMER20',
                0
            );

            expect(result.finalAmount).toBe(80);
            expect(result.discountCode).toBe('SUMMER20');
        });

        it('should apply WELCOME10 discount ($10 off)', () => {
            const result = paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                'WELCOME10',
                0
            );

            expect(result.finalAmount).toBe(90);
            expect(result.discountCode).toBe('WELCOME10');
        });

        it('should log warning for unknown discount code', () => {
            const result = paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                'INVALID',
                0
            );

            expect(result.finalAmount).toBe(100);
            expect(console.log).toHaveBeenCalledWith('Unknown discount code');
        });

        it('should process payment without discount code', () => {
            const result = paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                0
            );

            expect(result.finalAmount).toBe(100);
        });
    });

    describe('processPayment - Currency Conversion', () => {
        it('should convert non-USD currency', () => {
            const result = paymentProcessor.processPayment(
                100,
                'EUR',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                0
            );

            expect(result.finalAmount).toBe(120); // 100 * 1.2
            expect(result.currency).toBe('EUR');
        });

        it('should not convert USD currency', () => {
            const result = paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                0
            );

            expect(result.finalAmount).toBe(100);
        });

        it('should apply discount before currency conversion', () => {
            const result = paymentProcessor.processPayment(
                100,
                'EUR',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                'SUMMER20',
                0
            );

            // 100 * 0.8 (discount) = 80, then 80 * 1.2 (conversion) = 96
            expect(result.finalAmount).toBe(96);
        });
    });

    describe('processPayment - Transaction Object', () => {
        it('should create transaction with all required fields', () => {
            const result = paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                'SUMMER20',
                1
            );

            expect(result).toHaveProperty('userId', 'user123');
            expect(result).toHaveProperty('originalAmount', 100);
            expect(result).toHaveProperty('finalAmount', 80);
            expect(result).toHaveProperty('currency', 'USD');
            expect(result).toHaveProperty('paymentMethod', 'credit_card');
            expect(result).toHaveProperty('metadata');
            expect(result).toHaveProperty('discountCode', 'SUMMER20');
            expect(result).toHaveProperty('fraudChecked', 1);
            expect(result).toHaveProperty('timestamp');
            expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        });
    });

    describe('processPayment - API Error Handling', () => {
        it('should throw error when API call fails', () => {
            mockApiClient.post.mockRejectedValue(new Error('Network error'));

            expect(() => {
                paymentProcessor.processPayment(
                    100,
                    'USD',
                    'user123',
                    'credit_card',
                    { cardNumber: '4111111111111111', expiry: '12/25' },
                    null,
                    0
                );
            }).rejects.toThrow('Network error');
        });
    });

    describe('_lightFraudCheck', () => {
        it('should log very low risk for amounts below 10', () => {
            paymentProcessor._lightFraudCheck('user123', 5);

            expect(console.log).toHaveBeenCalledWith(
                'Light fraud check for user user123 on amount 5'
            );
            expect(console.log).toHaveBeenCalledWith('Very low risk');
        });

        it('should log low risk for amounts 10 and above', () => {
            paymentProcessor._lightFraudCheck('user123', 50);

            expect(console.log).toHaveBeenCalledWith(
                'Light fraud check for user user123 on amount 50'
            );
            expect(console.log).toHaveBeenCalledWith('Low risk');
        });
    });

    describe('_heavyFraudCheck', () => {
        it('should log medium risk for amounts below 1000', () => {
            paymentProcessor._heavyFraudCheck('user123', 500);

            expect(console.log).toHaveBeenCalledWith(
                'Heavy fraud check for user user123 on amount 500'
            );
            expect(console.log).toHaveBeenCalledWith('Medium risk');
        });

        it('should log high risk for amounts 1000 and above', () => {
            paymentProcessor._heavyFraudCheck('user123', 2000);

            expect(console.log).toHaveBeenCalledWith(
                'Heavy fraud check for user user123 on amount 2000'
            );
            expect(console.log).toHaveBeenCalledWith('High risk');
        });
    });

    describe('_sendConfirmationEmail', () => {
        it('should log confirmation email', () => {
            paymentProcessor._sendConfirmationEmail('user123', 100, 'USD');

            expect(console.log).toHaveBeenCalledWith(
                'Sending email to user user123: Your payment of 100 USD was successful.'
            );
        });
    });

    describe('_logAnalytics', () => {
        it('should log analytics event', () => {
            const data = { userId: 'user123', amount: 100 };
            paymentProcessor._logAnalytics(data);

            expect(console.log).toHaveBeenCalledWith('Analytics event:', data);
        });
    });

    describe('refundPayment', () => {
        it('should process a refund with 5% fee', () => {
            const result = paymentProcessor.refundPayment(
                'txn123',
                'user123',
                'Customer request',
                100,
                'USD',
                { originalTransaction: 'txn123' }
            );

            expect(result).toMatchObject({
                transactionId: 'txn123',
                userId: 'user123',
                reason: 'Customer request',
                amount: 100,
                currency: 'USD',
                netAmount: 95 // 100 - (100 * 0.05)
            });
            expect(mockApiClient.post).toHaveBeenCalledWith(
                '/payments/refund',
                expect.any(Object)
            );
        });

        it('should include date in refund object', () => {
            const result = paymentProcessor.refundPayment(
                'txn123',
                'user123',
                'Duplicate charge',
                50,
                'USD',
                {}
            );

            expect(result.date).toBeInstanceOf(Date);
        });

        it('should calculate correct refund fee', () => {
            const result = paymentProcessor.refundPayment(
                'txn456',
                'user456',
                'Wrong item',
                200,
                'EUR',
                {}
            );

            expect(result.netAmount).toBe(190); // 200 - 10 (5% fee)
        });
    });
});