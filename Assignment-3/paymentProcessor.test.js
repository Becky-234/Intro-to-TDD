const PaymentProcessor = require('./paymentProcessor');

describe('PaymentProcessor', () => {
    let paymentProcessor;
    let mockApiClient;

    beforeEach(() => {
        mockApiClient = {
            post: jest.fn().mockResolvedValue({ success: true })
        };

        paymentProcessor = new PaymentProcessor(mockApiClient);

        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with apiClient and default conversion rate', () => {
            expect(paymentProcessor.apiClient).toBe(mockApiClient);
            expect(paymentProcessor.currencyConversionRate).toBe(1.2);
        });
    });

    describe('processPayment - Credit Card', () => {
        it('should process a valid credit card payment', async () => {
            const result = await paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                1
            );

            expect(result.userId).toBe('user123');
            expect(mockApiClient.post).toHaveBeenCalledWith('/payments/credit', expect.any(Object));
        });

        it('should throw for invalid card metadata', async () => {
            await expect(
                paymentProcessor.processPayment(
                    100,
                    'USD',
                    'user123',
                    'credit_card',
                    { expiry: '12/25' },
                    null,
                    1
                )
            ).rejects.toThrow('Invalid card metadata');
        });
    });

    describe('processPayment - PayPal', () => {
        it('should process valid PayPal payment', async () => {
            const result = await paymentProcessor.processPayment(
                50,
                'USD',
                'user456',
                'paypal',
                { paypalAccount: 'user@example.com' },
                null,
                1
            );

            expect(result.paymentMethod).toBe('paypal');
            expect(mockApiClient.post).toHaveBeenCalledWith('/payments/paypal', expect.any(Object));
        });

        it('should throw for invalid PayPal metadata', async () => {
            await expect(
                paymentProcessor.processPayment(
                    50,
                    'USD',
                    'user456',
                    'paypal',
                    {},
                    null,
                    1
                )
            ).rejects.toThrow('Invalid PayPal metadata');
        });
    });

    describe('processPayment - Unsupported Method', () => {
        it('should throw for unsupported payment method', async () => {
            await expect(
                paymentProcessor.processPayment(
                    100,
                    'USD',
                    'user123',
                    'bitcoin',
                    {},
                    null,
                    1
                )
            ).rejects.toThrow('Unsupported payment method');
        });
    });

    describe('processPayment - Fraud Check', () => {
        it('should log light fraud check for small payment', async () => {
            await paymentProcessor.processPayment(
                50,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                1
            );

            expect(console.log).toHaveBeenCalledWith('Performing light fraud check for small payment');
        });

        it('should skip fraud check when fraudCheckLevel is 0', async () => {
            await paymentProcessor.processPayment(
                200,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                0
            );

            expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('fraud check'));
        });
    });

    describe('processPayment - Discounts', () => {
        it('should apply SUMMER20 discount (20%)', async () => {
            const result = await paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                'SUMMER20',
                0
            );

            expect(result.finalAmount).toBe(80);
        });

        it('should apply WELCOME10 ($10 off)', async () => {
            const result = await paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                'WELCOME10',
                0
            );

            expect(result.finalAmount).toBe(90);
        });
    });

    describe('processPayment - Currency Conversion', () => {
        it('should convert EUR using rate', async () => {
            const result = await paymentProcessor.processPayment(
                100,
                'EUR',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                null,
                0
            );

            expect(result.finalAmount).toBe(120);
        });
    });

    describe('processPayment - Transaction Object', () => {
        it('should return complete transaction fields', async () => {
            const result = await paymentProcessor.processPayment(
                100,
                'USD',
                'user123',
                'credit_card',
                { cardNumber: '4111111111111111', expiry: '12/25' },
                'SUMMER20',
                1
            );

            expect(result).toHaveProperty('timestamp');
            expect(result.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
        });
    });

    describe('API Error Handling', () => {
        it('should throw API error', async () => {
            mockApiClient.post.mockRejectedValue(new Error('Network error'));

            await expect(
                paymentProcessor.processPayment(
                    100,
                    'USD',
                    'user123',
                    'credit_card',
                    { cardNumber: '4111111111111111', expiry: '12/25' },
                    null,
                    0
                )
            ).rejects.toThrow('Network error');
        });
    });

    describe('refundPayment', () => {
        it('should calculate refund with 5% fee', async () => {
            const result = await paymentProcessor.refundPayment(
                'txn123',
                'user123',
                'Customer request',
                100,
                'USD',
                {}
            );

            expect(result.netAmount).toBe(95);
            expect(mockApiClient.post).toHaveBeenCalledWith('/payments/refund', expect.any(Object));
        });
    });
});
