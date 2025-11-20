
const UserRegistration = require('./userRegistration');

test('register() sends welcome email via EmailService', () => {
    // Create a mock function for send
    const mockSend = jest.fn();

    // Create a fake emailService object with the send mock
    const fakeEmailService = { send: mockSend };

    const reg = new UserRegistration(fakeEmailService);
    const user = { name: 'Becky', email: 'becky@gmail.com' };

    const result = reg.register(user);

    // assert registration result
    expect(result).toEqual({ success: true, userId: 123 });

    // assert the mock was called correctly
    expect(mockSend).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledWith(
        'becky@gmail.com',
        'Welcome!',
        'Hi Becky'
    );

    // assert number of calls
    expect(mockSend).toHaveBeenCalledTimes(1);
});








