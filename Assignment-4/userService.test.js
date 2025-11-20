
const UserService = require('./userService');
const FakeUserRepository = require('./fakeUserRepository');

test('registers a new user using a fake repo', () => {
    const fakeRepo = new FakeUserRepository();  // fake database

    const service = new UserService(fakeRepo);

    const user = { name: 'Becky', email: 'becky@example.com' };

    const result = service.registerUser(user);

    expect(result).toEqual(user);
    expect(fakeRepo.storage.length).toBe(1); // fake storage updated
});

test('throws error when email already exists (fake repo)', () => {
    const fakeRepo = new FakeUserRepository();

    fakeRepo.save({ name: 'Existing', email: 'becky@example.com' });

    const service = new UserService(fakeRepo);

    expect(() =>
        service.registerUser({ name: 'New', email: 'becky@example.com' })
    ).toThrow("Email already exists");
});

